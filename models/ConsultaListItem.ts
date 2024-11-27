import PacienteListItem from "./PacienteListItem"

export default class ConsultaListItem {
    public static fromSlug(slug: string): ConsultaListItem | null {
        try {
            const [id, yyyy, mm, dd, HH, MM, DH, DM, ...pacienteSlugSep] = slug.split('-')
            const nums = [id, yyyy, mm, dd, HH, MM, DH, DM].map(frag => Number(frag))
            if (nums.some(num => isNaN(num))) {
                return null
            }
            const data = new Date(`${yyyy}-${mm}-${dd}T${HH}:${MM}`)
            const duracao = new Date(`1970-01-01T${String(DH).padStart(2, '0')}:${String(DM).padStart(2, '0')}Z`)
            const paciente_slug = pacienteSlugSep.join('-')
            const paciente = PacienteListItem.fromSlug(paciente_slug)
            if (!paciente) {
                return null
            }
            return new ConsultaListItem(
                Number(id), data, Number(duracao), paciente
            )
        } catch(e) {
            console.error(e)
            return null
        }
    }

    /**
     * @param id                ID único
     * @param data              Início da consulta
     * @param duracao           Duração em milissegundos
     * @param paciente          Identificador do paciente
     */
    constructor(
        public id: number,
        public data: Date,
        public duracao: number,
        public paciente: PacienteListItem
    ) {}

    public get slug() {
        const dataFormatada = `${
            String(this.data.getFullYear()).padStart(4, '0')
        }-${
            String(this.data.getMonth() + 1).padStart(2, '0')
        }-${
            String(this.data.getDate()).padStart(2, '0')
        }-${
            String(this.data.getHours()).padStart(2, '0')
        }-${
            String(this.data.getMinutes()).padStart(2, '0')
        }`

        const duracaoDate = new Date(this.duracao)
        const duracaoFormatada = `${duracaoDate.getUTCHours()}-${duracaoDate.getUTCMinutes()}`

        return `${this.id}-${dataFormatada}-${duracaoFormatada}-${this.paciente.slug}`
    }
}