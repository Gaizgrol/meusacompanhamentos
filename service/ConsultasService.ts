import PacienteListItem from "@/models/PacienteListItem";
import { StorageService } from "./StorageService";
import Consulta from "@/models/Consulta";
import PacientesService from "./PacientesService";
import ConsultaListItem from "@/models/ConsultaListItem";

export default class ConsultasService {
    private static KEY_CONSULTAS_PROXIMO_ID = 'consultas_proximo_id'

    private static async proximoID() {
        const dados = await StorageService.buscar([this.KEY_CONSULTAS_PROXIMO_ID])
        // Erro
        if (!dados) {
            return null
        }
        // Primeira leitura
        if (!dados[this.KEY_CONSULTAS_PROXIMO_ID]) {
            const inicial = 1
            const sucesso = await StorageService.armazenar([{
                slug: this.KEY_CONSULTAS_PROXIMO_ID,
                dados: inicial + 1
            }])
            if (!sucesso) {
                return null
            }
            return inicial
        }
        // Próximas leituras
        try {
            const proximoIDSerializado = dados[this.KEY_CONSULTAS_PROXIMO_ID]
            const proximoID = Number(proximoIDSerializado)
            if (isNaN(proximoID)) {
                return null
            }
            // Armazena o próximo ID
            const sucesso = await StorageService.armazenar([{
                slug: this.KEY_CONSULTAS_PROXIMO_ID,
                dados: proximoID + 1
            }])
            if (!sucesso) {
                return null
            }
            return proximoID
        } catch(e) {
            console.error(e)
            return null
        }
    }

    public static async listaConsultas(anos: number[]): Promise<Record<number, ConsultaListItem[]> | null> {
        const dados = await StorageService.buscar(anos.map(ano => `${ano}-consultas`))
        if (!dados) {
            return null
        }
        const map: Record<number, ConsultaListItem[]> = {}
        for (const ano of anos) {
            const key = `${ano}-consultas`
            const listaSerializada = dados[key] ? JSON.parse(dados[key]) as string[] : []
            map[Number(ano)] = listaSerializada
                .map(el => ConsultaListItem.fromSlug(el))
                .filter(c => c) as ConsultaListItem[]
        }
        return map
    }

    public static async nova(data: Date, duracao: number, paciente: PacienteListItem): Promise<Consulta | null> {
        const proximoID = await this.proximoID()
        // Falha ao criar próximo identificador da consulta
        if (!proximoID) {
            return null
        }
        const pacienteDetalhes = await PacientesService.detalhes(paciente.slug)
        // Paciente inexistente
        if (!pacienteDetalhes) {
            return null
        }
        const listaConsultasKey = `${data.getUTCFullYear()}-consultas`
        const dados = await StorageService.buscar([listaConsultasKey])
        // Falha ao buscar a lista
        if (!dados) {
            return null
        }
        const listaConsultasSerializada = dados[listaConsultasKey]        
        const listaConsultas: string[] = !listaConsultasSerializada
            ? []
            : JSON.parse(listaConsultasSerializada)

        const consulta = new Consulta(proximoID, data, duracao, paciente, '')
        // Precisamos armazenar em 3 locais:
        // - Chave da consulta
        // - No paciente
        // - Na listagem de consultas do ano
        pacienteDetalhes.consultas.push(consulta)
        
        const sucesso = await StorageService.armazenar([
            consulta.toRecord(),
            pacienteDetalhes.toRecord(),
            {
                slug: listaConsultasKey,
                dados: !listaConsultas
                    ? [consulta.slug] // Primeira leitura
                    : [...listaConsultas, consulta.slug]
            }
        ])
        if (!sucesso) {
            return null
        }
        return consulta
    }
}