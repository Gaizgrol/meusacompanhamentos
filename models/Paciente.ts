import { Armazenavel } from "@/service/StorageService";
import ConsultaListItem from "./ConsultaListItem";
import PacienteListItem from "./PacienteListItem";

export default class Paciente extends PacienteListItem {
    constructor(
        id: number,
        nome: string,
        public informacoesGerais: string,
        public consultas: ConsultaListItem[],
    ) {
        super(id, nome)
    }

    public toRecord(): Armazenavel {
        return {
            slug: `paciente-${this.slug}`,
            dados: {
                id: this.id,
                nome: this.nome,
                informacoesGerais: this.informacoesGerais,
                consultas: this.consultas.map(c => c.slug)
            }
        }
    }
}