import AsyncStorage from "@react-native-async-storage/async-storage"

export type Armazenavel = {
    slug: string
    dados: any
}

export class StorageService {
    public static async armazenar(armazenaveis: Armazenavel[]) {
        try {
            const dados = armazenaveis.map(a => {
                const { slug, dados } = a
                return [ slug, JSON.stringify(dados) ] as [string, string]
            })
            await AsyncStorage.multiSet(dados)
            return true
        } catch(e) {
            console.error(e)
            return false
        }
    }

    public static async buscar(slugs: string[]) {
        try {
            const dados = await AsyncStorage.multiGet(slugs)
            const map = dados.reduce((map, [k, v]) => {
                if (v !== null && v !== undefined) {
                    map[k] = v;
                }
                return map
            }, {} as Record<string, string>)
            return map
        } catch(e) {
            console.error(e)
            return null
        }
    }

    public static async apagar(slugs: string[]) {
        try {
            await AsyncStorage.multiRemove(slugs)
            return true
        } catch(e) {
            console.error(e)
            return false
        }
    }
}