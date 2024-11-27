import PacienteListItem from '@/models/PacienteListItem';
import PacientesService from '@/service/PacientesService';
import { router, Stack, usePathname, useSegments } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, StatusBar, Platform, Button, SectionList, Pressable } from 'react-native';
import { Circle } from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function ListaPacientes() {
  const path = usePathname()

  const [pacientes, setPacientes] = useState<PacienteListItem[]>([])
  const pacientesOrdenados = useMemo(
    () => Object.entries(
      pacientes
        .sort((p1, p2) => p1.nome.localeCompare(p2.nome))
        .reduce(
          (map, p) => {
            const [primeiraLetra] = p.nome
            map[primeiraLetra] ??= []
            map[primeiraLetra].push(p)
            return map
          },
          {} as Record<string, PacienteListItem[]>
        )
    ).map(
      ([chave, valor]) => ({ title: chave, data: valor })
    ),
    [pacientes]
  )
  const recarregar = useCallback(async () => {
    const ps = await PacientesService.listaPacientes()
    if (!ps) return;
    setPacientes(ps)
  }, [])

  useEffect(() => {
    if (path !== '/') return;
    recarregar()
  }, [path])

  return <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => <Button title="Novo" onPress={() => { router.push('/usuario') }}/>
        }}
      />
      {pacientes.length === 0
        ? <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#AFAFAF' }}>Não há pacientes registrados</Text>
        </View>
        : <SectionList
        style={{ flex: 1 }}
        sections={pacientesOrdenados}
        renderSectionHeader={({ section: { title } }) => <Text
          style={{ fontSize: 20, padding: 8, backgroundColor: '#EFEFEF'}}
        >
          {title}
        </Text>}
        renderItem={({ item }) => <Pressable
          style={
            ({ pressed }) => ({ borderRadius: 8, marginLeft: 8, marginRight: 8, marginBottom: 4, padding: 8, backgroundColor: pressed ? '#AFAFAF' : 'white' })
          }
          children={
            ({ pressed }) => <Text
              style={{ fontSize: 16, color: pressed ? 'white' : 'black' }}
            >
              {item.nome}
            </Text>
          }
          onPress={() => {
            router.push(`/usuario/${item.slug}`)
          }}
        />}
      />}
  </View>
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 8
  }
});
