export default class PacienteListItem {
    public static fromSlug(slug: string): PacienteListItem | null {
        const [id, ...fragmentosNome] = slug.split('-')
        const idNumero = Number(id)
        if (isNaN(idNumero)) {
            return null
        }
        const nome = fragmentosNome.join('-')
        return new PacienteListItem(idNumero, nome)
    }

    constructor(
        public id: number,
        public nome: string
    ) {}

    public get slug() {
        return `${this.id}-${this.nome}`
    }
}