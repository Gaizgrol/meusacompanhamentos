import PacienteListItem from "@/models/PacienteListItem";
import { StorageService } from "./StorageService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Paciente from "@/models/Paciente";
import ConsultaListItem from "@/models/ConsultaListItem";
import ConsultasService from "./ConsultasService";

export default class PacientesService {
    private static KEY_PACIENTES = 'pacientes'
    private static KEY_PACIENTES_PROXIMO_ID = 'pacientes_proximo_id'

    private static async proximoID() {
        const dados = await StorageService.buscar([this.KEY_PACIENTES_PROXIMO_ID])
        // Erro
        if (!dados) {
            return null
        }
        // Primeira leitura
        if (!dados[this.KEY_PACIENTES_PROXIMO_ID]) {
            const inicial = 1
            const sucesso = await StorageService.armazenar([{
                slug: this.KEY_PACIENTES_PROXIMO_ID,
                dados: inicial + 1
            }])
            if (!sucesso) {
                return null
            }
            return inicial
        }
        // Próximas leituras
        try {
            const proximoIDSerializado = dados[this.KEY_PACIENTES_PROXIMO_ID]
            const proximoID = Number(proximoIDSerializado)
            if (isNaN(proximoID)) {
                return null
            }
            // Armazena o próximo ID
            const sucesso = await StorageService.armazenar([{
                slug: this.KEY_PACIENTES_PROXIMO_ID,
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

    public static async listaPacientes() {
        const dados = await StorageService.buscar([this.KEY_PACIENTES])
        // Erro
        if (!dados) {
            return null
        }
        // Primeira leitura
        if (!dados[this.KEY_PACIENTES]) {
            const sucesso = await StorageService.armazenar([{
                slug: this.KEY_PACIENTES,
                dados: []
            }])
            if (!sucesso) {
                return null
            }
            return []
        }
        // Próximas leituras
        try {
            const pacientesSerializados = dados[this.KEY_PACIENTES]
            const pacientesSlugs = JSON.parse(pacientesSerializados) as string[]
            const pacientes = pacientesSlugs.map(ps => PacienteListItem.fromSlug(ps)).filter(p => p)
            return pacientes as PacienteListItem[]
        } catch(e) {
            console.error(e)
            return null
        }
    }

    public static async novo(nome: string): Promise<Paciente | null> {
        const proximoId = await this.proximoID()
        // Falha ao criar o próximo ID
        if (!proximoId) {
            return null
        }
        // Falha ao buscar os pacientes
        const pacientes = await this.listaPacientes()
        if (!pacientes) {
            return null
        }
        // Por algum motivo o paciente já existe
        if (pacientes.find(p => p.id === proximoId)) {
            return null
        }
        const novo = new Paciente(proximoId, nome, '', [])
        const sucesso = await StorageService.armazenar([
            {
                slug: this.KEY_PACIENTES,
                dados: [...pacientes.map(p => p.slug), novo.slug]
            },
            novo.toRecord()
        ])
        // Falha ao salvar dados
        if (!sucesso) {
            return null
        }
        return novo
    }

    public static async detalhes(slug: string) {
        const key = `paciente-${slug}`
        const dados = await StorageService.buscar([key])
        // Não encontrado
        if (!dados || !dados[key]) {
            return null
        }
        const { id, nome, informacoesGerais, consultas } = JSON.parse(dados[key])
        return new Paciente(
            id,
            nome,
            informacoesGerais ?? '',
            (consultas as string[])?.map(
                c => ConsultaListItem.fromSlug(c) as ConsultaListItem
            ).filter(
                c => c
            ) ?? []
        )
    }

    public static async apagar(paciente: Paciente) {
        // Falha ao buscar a lista de pacientes
        const pacientes = await this.listaPacientes()
        if (!pacientes) {
            return false
        }
        const anos = [...new Set(paciente.consultas.map(c => c.data.getFullYear()))]
        const listasConsultasAnos = await ConsultasService.listaConsultas(anos)
        if (!listasConsultasAnos) {
            return false
        }
        // Para cada consulta, encontrar qual a lista pertencente e sair dela.
        for (const consulta of paciente.consultas) {
            const listaAno = listasConsultasAnos[consulta.data.getFullYear()]
            const index = listaAno.findIndex(c => c.id === consulta.id)
            if (index !== -1) {
                listaAno.splice(index, 1)
            }
        }

        // Apagar consultas individualmente e depois apagar o paciente
        await StorageService.apagar([
            ...paciente.consultas.map(c => c.slug),
            paciente.slug,
        ])
        // Reescrever as lista de consultas
        await StorageService.armazenar(
            Object.entries(listasConsultasAnos).map(
                ([ano, lista]) => ({
                    slug: `${ano}-consultas`,
                    dados: lista.map(c => c.slug)
                })
            ),
        )

        const index = pacientes.findIndex(p => p.id === paciente.id)
        if (index === -1) {
            return true
        }
        
        // Reescreve a lista de pacientes
        pacientes.splice(index, 1)
        await StorageService.armazenar([
            {
                slug: this.KEY_PACIENTES,
                dados: pacientes.map(p => p.slug)
            }
        ])
        return true
    }

    public static async editar(paciente: Paciente) {
        try {
            const sucesso = await StorageService.armazenar([ paciente.toRecord() ])
            return sucesso
        } catch(e) {
            console.error(e)
            return false
        }
    }
}