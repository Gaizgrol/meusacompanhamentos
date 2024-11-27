import { Armazenavel } from "@/service/StorageService";
import ConsultaListItem from "./ConsultaListItem";
import PacienteListItem from "./PacienteListItem";

export default class Consulta extends ConsultaListItem {
    constructor(
        id: number,
        data: Date,
        duracao: number,
        paciente: PacienteListItem,
        public informacoes: string
    ) {
        super(id, data, duracao, paciente)
    }

    public toRecord(): Armazenavel {
        return {
            slug: `consulta-${this.slug}`,
            dados: {
                informacoes: this.informacoes
            }
        }
    }
}