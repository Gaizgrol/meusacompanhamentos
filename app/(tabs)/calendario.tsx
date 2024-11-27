import ConsultaListItemComponent from '@/components/ConsultaListItemComponent';
import ConsultaListItem from '@/models/ConsultaListItem';
import ConsultasService from '@/service/ConsultasService';
import { router, Stack, usePathname } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AgendaList, CalendarProvider, ExpandableCalendar, LocaleConfig } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';

const toymd = (data: Date) => data.toLocaleDateString()
.split('/')
.reverse()
.join('-')

const marked = { marked: true }

// pt-br localization for react-native-calendars
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ],
  monthNamesShort: [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul.',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dec',
  ],
  dayNames: [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt-br';

export default function Calendario() {
  const [data, setData] = useState(() => toymd(new Date()))

  const [consultas, setConsultas] = useState<ConsultaListItem[]>([])

  const recarregar = useCallback(async () => {
    const consultasPorAno = await ConsultasService.listaConsultas([new Date().getFullYear()])
    if (!consultasPorAno) return;
    const consultas = Object.values(consultasPorAno).flatMap(cs => cs)
    setConsultas(consultas)
  }, [])

  const path = usePathname()

  useEffect(() => {
    if (path !== '/calendario') return;
    recarregar()
  }, [path])

  const secoesConsultas = useMemo(
    () => Object.entries(
      consultas.reduce(
        (map, p) => {
          const ymd = toymd(p.data)
          map[ymd] ??= []
          map[ymd].push(p)
          return map
        },
        {} as Record<string, ConsultaListItem[]>
      )
    ).map(
      ([chave, valor]) => ({ title: chave, data: valor.sort((a, b) => Number(a.data)-Number(b.data)) })
    ).sort((s1, s2) => s1.title.localeCompare(s2.title)),
    [consultas]
  )

  const datasComConsultas = useMemo(
    () => secoesConsultas.reduce(
      (map, s) => {
        map[s.title] = marked
        return map
      },
      {} as Record<string, typeof marked>
    ),
    [secoesConsultas]
  )

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => <Button title='Nova consulta' onPress={() => router.push('/consulta')}/>
        }}
      />
      <CalendarProvider
        date={data}
        showTodayButton 
      >
        <ExpandableCalendar
          initialPosition={ExpandableCalendar.positions.OPEN}
          markedDates={datasComConsultas}
          closeOnDayPress={false}
          horizontal
          hideArrows
          allowShadow
        />
        <AgendaList
          sections={secoesConsultas}
          dayFormatter={d => new Date(`${d}T03:00Z`).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
          renderItem={({ item }: { item: ConsultaListItem }) => <View style={{ marginBottom: 4 }}>
            <ConsultaListItemComponent key={item.slug} mostrarPaciente consultaItem={item}/>
          </View>}
          ListEmptyComponent={<Text style={{ textAlign: 'center', padding: 24 }}>
            Não há próximos eventos
          </Text>}
        />
      </CalendarProvider>
    </View>
  );
}