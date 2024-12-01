import {ChevronLeft, ChevronRight} from '@tamagui/lucide-icons'
import {useExpoRouter} from 'expo-router/build/global-state/router-store'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import NotesComponent from '~/components/atoms/Note'
import {PositiveButton} from '~/components/atoms/PositiveButton'
import GradientScrollContainer from '~/components/molecules/container/GradientScrollContainer'
import DateComponent from '~/components/molecules/Date'
import Specialist from '~/components/organisms/Specialist'
import useTranslation from '~/hooks/useTranslation'

import TimePicker from '../molecules/Time'
import {useLocalSearchParams} from "expo-router";
import {useRoute} from "@react-navigation/core";
import React, {useEffect, useLayoutEffect, useState} from "react";
import type User from "~/interfaces/User";
import { isNil } from "lodash";
import useStorage from "~/hooks/useStorage";
import type Stylist from "~/interfaces/Stylist";
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import duration from 'dayjs/plugin/duration'
import {request} from "~/apis/HttpClient";
import {setUser} from "~/features/userSlice";

const SpecialistTemplate: React.FC = (): JSX.Element => {
  const router = useExpoRouter()
  const leftIcon = <ChevronLeft size={25} onPress={() => router.goBack()}/>
  const rightIcon = <ChevronRight size={25} opacity={0}/>
  const {t} = useTranslation()
  const insets = useSafeAreaInsets()

  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const { getObjectItem } = useStorage()

  const [user, setUser] = React.useState<User>()
  dayjs.extend(customParseFormat)
  dayjs.extend(timezone)
  dayjs.extend(utc)
  dayjs.extend(duration)

  const fetchUserLocal = async (): Promise<void> => {
    const userData = await getObjectItem('userData') as User
    if (!isNil(userData)) {
      setUser(userData)
    }
  }
  useLayoutEffect(() => {
    fetchUserLocal().catch((e) => { console.error(e) })
  }, [])
  const route = useRoute()

  // const stylist = {
  //   avatar: null,
  //   email: 'jane.doe@example.com',
  //   experience: '5 years',
  //   full_name: 'Jane Doe',
  //   gender: GenderEnum.FEMALE,
  //   id: 'stylist1',
  //   isActive: true,
  //   phoneNumber: '123456789',
  //   position: 'Hair Stylist',
  //   rating: 4.5,
  //   workSchedule: '07:30-22:30'
  // }

  // const handleTimeSelected = (stylistId: string, selectedTime: string) => {
  //   console.log(`Stylist ${stylistId} selected time: ${selectedTime}`)
  // Gửi dữ liệu tới API
  // fetch('/api/book-time', {
  //   method: 'POST',
  //   body: JSON.stringify({ stylistId, selectedTime })
  // })
  // }
  const onPayment = async (): Promise<void> => {
    if (
      isNil(selectedDay) || isNil(selectedTime) || isNil(selectedStylist?.id)
    ) return

    const obj = JSON.parse(route.params?.item)
    const startTime = dayjs(`${selectedDay} ${selectedTime}`, 'YYYY-MM-DD hh:mm A').tz(dayjs.tz.guess(), true)
    const payload = {
      start_time: startTime.toISOString(),
      end_time: startTime.add(obj?.total_time, "m").toISOString(),
      combo_id: obj?.id,
      customer_id: user?.result?.id,
      stylist_id: selectedStylist?.id
    }

    console.log('payload:', payload)
    const response = await request.post<any>('/booking', payload)
    console.log('response:', response)
  }

  return (
    <>
      <GradientScrollContainer
        paddingHorizontal={0}
        edges={['left', 'right', 'bottom']}
        headerTitle={t('specialist.title')}
        isHeaderCenter={true}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        paddingTop={10}
      >
        <Specialist toSetSelectedUser={setSelectedStylist}/>
        <DateComponent toSetSelectedDay={setSelectedDay}/>
        <TimePicker toSetSelectedTime={setSelectedTime}/>
        {/* <NotesComponent
          title={t('specialist.notes')}
          placeholder="Write your thoughts here..."
          onSave={(value) => {
            console.log('Saved Notes:', value)
            // Thực hiện lưu trữ hoặc gọi API
          }}

        /> */}
      </GradientScrollContainer>

      <PositiveButton
        title={t('specialist.send')}
        onPress={() => {
          onPayment().catch((err) => { console.error(err) })
        }}
        marginHorizontal={20}
        position="absolute"
        left={0}
        right={0}
        bottom={insets.bottom === 0 ? 20 : insets.bottom}

      />
    </>
  )
}

export default SpecialistTemplate
