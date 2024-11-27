import { Collapsible } from "@/components/Collapsible";
import ConsultaListItemComponent from "@/components/ConsultaListItemComponent";
import InputTexto from "@/components/InputTexto";
import { IconSymbol } from "@/components/ui/IconSymbol";
import ConsultaListItem from "@/models/ConsultaListItem";
import Paciente from "@/models/Paciente";
import PacienteListItem from "@/models/PacienteListItem";
import PacientesService from "@/service/PacientesService";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Link, router, Stack, useLocalSearchParams, usePathname } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { Bar } from "react-native-progress";
import { SafeAreaView } from "react-native-safe-area-context";

const OPCOES_GERAIS: string[] = []
const APAGAR_OG = {pos: 0, val: 'Apagar'};
const EDITAR_OG = {pos: 1, val: 'Editar'};
const NOVA_CONSULTA_OG = {pos: 2, val: 'Nova consulta'};
const CANCELAR_OG = {pos: 3, val: 'Cancelar'};

[APAGAR_OG, EDITAR_OG, NOVA_CONSULTA_OG, CANCELAR_OG].forEach(({pos, val}) => OPCOES_GERAIS[pos] = val)

const OPCOES_EDITANDO: string[] = []
const DESCARTAR_OE = {pos: 0, val: 'Descartar alterações'};
const SALVAR_OE = {pos: 1, val: 'Salvar alterações'};
const VOLTAR_OE = {pos: 2, val: 'Voltar para edição'};

[DESCARTAR_OE, SALVAR_OE, VOLTAR_OE].forEach(({pos, val}) => OPCOES_EDITANDO[pos] = val)


export default function Usuario() {
    const { slug } = useLocalSearchParams()
    const path = usePathname()
    const { showActionSheetWithOptions } = useActionSheet()

    const paciente = useMemo(
        () => PacienteListItem.fromSlug((Array.isArray(slug) ? slug[0] : slug) || ''),
        [slug]
    )
    const [detalhes, setDetalhes] = useState<Paciente | null>(null)

    const [editando, setEditando] = useState(false)

    const buscarInformacoes = useCallback(async () => {
        console.log('buscando...')
        if (!paciente) return;
        const dp = await PacientesService.detalhes(paciente.slug)
        if (!dp) return;
        setDetalhes(dp)
    }, [])

    useEffect(() => {
        if (path !== `/usuario/${paciente?.slug ?? '---'}`) return;
        buscarInformacoes()
    }, [path])

    const apagar = useCallback(() => {
        Alert.alert(
            `Deseja apagar ${detalhes?.nome ? `"${detalhes.nome}"` : 'este paciente'}?`,
            'Todos os dados serão apagados. Esta ação não poderá ser desfeita.',
            [
                {
                    text: 'Voltar',
                    style: 'cancel'
                },
                {
                    text: 'Apagar',
                    onPress: async () => {
                        if (!detalhes) {
                            return;
                        }
                        const sucesso = await PacientesService.apagar(detalhes)
                        if (sucesso) {
                            router.back()
                        }
                    },
                    style: 'destructive'
                }
            ],
            { cancelable: true }
        )
    }, [detalhes])

    if (!paciente) {
        return <View style={{ flex: 1, padding: 8, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#FF7F7F', paddingBottom: 128 }}>Falha ao carregar informações</Text>
        </View>
    }

    return <View style={{ flex: 1, padding: 8, flexDirection: 'column', alignItems: 'stretch', gap: 24 }}>
        <Stack.Screen
            options={{
                headerBackVisible: !editando,
                headerRight: () => <Button
                    title='Opções'
                    onPress={() =>  {
                        if (!editando) {
                            showActionSheetWithOptions({
                                options: OPCOES_GERAIS,
                                cancelButtonIndex: CANCELAR_OG.pos,
                                destructiveButtonIndex: APAGAR_OG.pos
                            }, async (opcao: number | undefined) => {
                                switch (opcao) {
                                    case APAGAR_OG.pos: apagar();
                                        break;
                                    case EDITAR_OG.pos: setEditando(true);
                                        break;
                                    case NOVA_CONSULTA_OG.pos:
                                        // setTimeout(() => setDetalhes(null), 1000)
                                        router.push(`/consulta?paciente=${paciente.slug}`);
                                        break;
                                    case CANCELAR_OG.pos:
                                    default:
                                        break;
                                }
                            })
                        } else {
                            showActionSheetWithOptions({
                                options: OPCOES_EDITANDO,
                                cancelButtonIndex: VOLTAR_OE.pos,
                                destructiveButtonIndex: DESCARTAR_OE.pos
                            }, async (opcao: number | undefined) => {
                                switch (opcao) {
                                    case SALVAR_OE.pos:
                                    case DESCARTAR_OE.pos:
                                        setEditando(false);
                                        break;
                                    case VOLTAR_OE.pos:
                                    default:
                                        break;
                                }
                            })
                        }
                    }}
                />
            }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'stretch', paddingTop: 12 }}>
            {/* <View style={{ width: 48, height: 48, backgroundColor: '#007FFF', borderRadius: 24 }}/> */}
            <IconSymbol name='figure' color='#007FFF' style={{ width: 48, height: 48 }}/>
            <View style={{ flexDirection: 'column', alignItems: 'stretch', flex: 1, marginLeft: 16, }}>
                <Text style={{ color: '#007FFF' }}>Nome</Text>
                {editando
                    ? <InputTexto/>
                    : <Text style={{ fontSize: 20, color: '#000000' }}>
                        {paciente?.nome ?? 'Sem informações'}
                    </Text>
                }
            </View>
        </View>
        <Collapsible defaultOpen title="Informações gerais">
            <View style={{backgroundColor: 'white', borderRadius: 8, padding: 16}}>
                {editando
                    ? <InputTexto autoFocus multiline numberOfLines={8} style={{ fontSize: 14 }}/>
                    : <Text selectable>Nenhuma informação</Text>
                }
            </View>
        </Collapsible>
        <Collapsible defaultOpen title="Consultas">
            <View style={{ gap: 4 }}>
                {detalhes?.consultas.length
                    ? detalhes.consultas
                        .sort((c1, c2) => Number(c2.data) - Number(c1.data))
                        .map((c) => <ConsultaListItemComponent key={c.slug} mostrarData consultaItem={c}/>)
                    : <Text>Nenhuma consulta</Text>
                }
            </View>
        </Collapsible>
    </View>
}