import InputTexto from "@/components/InputTexto";
import PacientesService from "@/service/PacientesService";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Button, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { Bar } from "react-native-progress";

export default function NovoUsuario() {
    const [nome, setNome] = useState('')

    const [loading, setLoading] = useState(false)

    const salvar = useCallback(async () => {
        if (loading) return;
        setLoading(true)
        const novoPaciente = await PacientesService.novo(nome)
        setLoading(false)
        if (novoPaciente) {
            router.replace(`/usuario/${novoPaciente.slug}`)
        }
    }, [nome])

    return <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch', padding: 8 }}
    >
        <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'stretch', paddingTop: 12 }}>
                    <View style={{ width: 48, height: 48, backgroundColor: '#007FFF', borderRadius: 24 }}/>
                    <View style={{ flexDirection: 'column', alignItems: 'stretch', flex: 1, marginLeft: 16, }}>
                        <Text style={{ color: '#007FFF' }}>Nome</Text>
                        <InputTexto
                            autoFocus
                            loading={loading}
                            value={nome}
                            onChangeText={setNome}
                        />
                    </View>
                </View>
                <View style={{ marginBottom: 36, flexDirection: 'column', alignItems: 'stretch' }}>
                    <Button disabled={!nome.trim() || loading} onPress={salvar} title="Salvar"/>
                </View>
            </View>
        </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
}