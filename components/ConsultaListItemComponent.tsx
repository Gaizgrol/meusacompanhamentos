import ConsultaListItem from "@/models/ConsultaListItem"
import { Button, Text } from "react-native"
import { View } from "react-native"
import { IconSymbol } from "./ui/IconSymbol"

export type ConsultaListItemComponentProps = {
    consultaItem: ConsultaListItem
    mostrarData?: boolean
    mostrarPaciente?: boolean
}

export default function ConsultaListItemComponent({
    mostrarData,
    mostrarPaciente,
    consultaItem: { data, duracao, paciente }
}: ConsultaListItemComponentProps) {
    const dataDuracao = new Date(duracao)
    const dH = dataDuracao.getUTCHours()
    const dM = dataDuracao.getUTCMinutes()
    return <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: 'white', borderRadius: 8, padding: 8 }}>
        <View style={{ flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 18, textAlign: 'center', backgroundColor: '#DFEFFF', borderRadius: 8, paddingLeft: 16, paddingRight: 16, width: 84 }}>
                {data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}
            </Text>
            {mostrarData && <Text>{data.toLocaleDateString('pt-BR')} </Text>}
        </View>
        <View style={{ flex: 1, gap: 4, flexDirection: 'row' }}>
            {mostrarPaciente && <View style={{ flex: 1, flexDirection: 'row' }}>
                <IconSymbol name='figure' color='#AFAFAF'/>
                <Text style={{ fontSize: 18 }}> {paciente.nome}</Text>
            </View>}
            <Text style={{ fontSize: mostrarPaciente ? 14 : 18 }}>{dH > 0 && `${dH}h`} {dM > 0 && `${dM}m`}</Text>
        </View>
        <Button title='Acessar'/>
    </View>
}