import DateTimePicker from '@react-native-community/datetimepicker';
import PacienteListItem from "@/models/PacienteListItem";
import PacientesService from "@/service/PacientesService";
import { Picker } from "@react-native-picker/picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import ConsultasService from '@/service/ConsultasService';

const _23H59M = (
    23 * 60/*m*/ * 60/*s*/ * 1000/*ms*/ +
         59/*m*/ * 60/*s*/ * 1000/*ms*/
)

export default function NovaConsulta() {
    const { paciente: _criarParaQuem } = useLocalSearchParams()
    const criarParaQuem = useMemo(
        () => (Array.isArray(_criarParaQuem) ? _criarParaQuem[0] : _criarParaQuem) || null,
        [_criarParaQuem]
    )

    const [listaPacientes, setListaPacientes] = useState<PacienteListItem[]>([])
    const [paciente, setPaciente] = useState(criarParaQuem)
    const [selecionandoPaciente, setSelecionandoPaciente] = useState(false)
    const [loading, setLoading] = useState(false)
    
    const [data, setData] = useState(new Date())
    const [duracao, setDuracao] = useState(0)

    useEffect(() => {
        // Bug da biblioteca, primeira vez que o
        // componente carrega não sabe que a
        // timezone é UTC. Necessário remediar.
        requestAnimationFrame(() => {
            setDuracao(60/*m*/ * 60/*s*/ * 1000/*ms*/)
        })
        if (criarParaQuem) return;
        (async () => {
            const pacientes = await PacientesService.listaPacientes()
            if (!pacientes) return;
            setListaPacientes(pacientes.sort((p1, p2) => p1.nome.localeCompare(p2.nome)))
        })()
    }, [])
    
    const salvar = useCallback(async () => {
        if (loading || !paciente) return;
        const p = PacienteListItem.fromSlug(paciente)
        if (!p) return;
        setLoading(true)
        const novaConsulta = await ConsultasService.nova(data, duracao, p)
        setLoading(false)
        if (novaConsulta) {
            router.back()
        }
    }, [loading, data, duracao, paciente])

    const pickerDuracao = useMemo(() => {
        const duracaoDate = new Date(duracao)
        return <DateTimePicker
            value={duracaoDate}
            onChange={ev => setDuracao(ev.nativeEvent.timestamp)}
            locale='pt-BR'
            timeZoneName='UTC'
            mode='countdown'
        />
    }, [duracao])

    return <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch' }}
    >
        <Stack.Screen
            options={{ title: 'Nova consulta' }}
        />
        <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, flexDirection: 'column', alignItems: 'stretch', padding: 8}}>
                    <View style={{ flexDirection: 'row', alignItems: 'stretch', paddingTop: 12 }}>
                        <View style={{ width: 48, height: 48, backgroundColor: '#007FFF', borderRadius: 24 }}/>
                        <View style={{ flexDirection: 'column', alignItems: 'stretch', flex: 1, marginLeft: 16, }}>
                            <Text style={{ color: '#007FFF' }}>Paciente</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 20, color: paciente ? 'black' : 'lightgray', flex: 1 }}>
                                    {paciente
                                        ? PacienteListItem.fromSlug(paciente ?? '')?.nome ?? 'Paciente não reconhecido'
                                        : 'Selecionar paciente...'
                                    }
                                </Text>
                                {!criarParaQuem && <Button title="Alterar" onPress={() => setSelecionandoPaciente(true)}/>}
                            </View>
                        </View>
                    </View>
                    <View style={{
                        flexDirection: 'column',
                        justifyContent: 'space-around',
                        marginTop: 16,
                        borderTopColor: 'lightgray',
                        borderTopWidth: 1,
                        borderBottomColor: 'lightgray',
                        borderBottomWidth: 1,
                        padding: 8,
                        gap: 8
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, flex: 1 }}>Data</Text>
                            <DateTimePicker
                                value={data}
                                onChange={ev => setData(new Date(ev.nativeEvent.timestamp))}
                                mode='date'
                                locale='pt-BR'
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, flex: 1 }}>Hora</Text>
                            <DateTimePicker
                                value={data}
                                onChange={ev => setData(new Date(ev.nativeEvent.timestamp))}
                                mode='time'
                                locale='pt-BR'
                            />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 8 }}>
                        <Text style={{ fontSize: 16, padding: 16 }}>Duração da consulta</Text>
                        {pickerDuracao}
                    </View>
                </View>
                <View style={{ marginBottom: 36, flexDirection: 'column', alignItems: 'stretch' }}>
                    <Button disabled={!paciente} onPress={salvar} title="Salvar"/>
                </View>
                {selecionandoPaciente && <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => setSelecionandoPaciente(false)}>
                    <View
                        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'stretch', justifyContent: 'flex-end', backgroundColor: '#0000003F' }}
                        onStartShouldSetResponder={ev => true}
                        onTouchEnd={(ev) => ev.stopPropagation()}
                    >
                        <TouchableWithoutFeedback>
                            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                                <Text style={{ textAlign: 'center', padding: 20, fontSize: 20, borderBottomWidth: 1, borderBottomColor: '#DFDFDF' }}>Selecionar paciente</Text>
                                <Picker
                                    selectedValue={paciente}
                                    onValueChange={(value) => {
                                        setPaciente(value || null)
                                    }}
                                    enabled={!criarParaQuem}
                                >
                                    <Picker.Item
                                        key='null'
                                        label='Selecionar paciente...'
                                        value=''
                                        color="#FF7F7F"
                                    />
                                    {listaPacientes.map(p => <Picker.Item
                                        key={p.id}
                                        label={p.nome}
                                        value={p.slug}
                                    />)}
                                </Picker>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>}
            </View>
        </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
}