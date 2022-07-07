import {StyleSheet, View, Text, ScrollView, Dimensions, ActivityIndicator} from 'react-native';
import * as Location from 'expo-location';
import {useEffect, useState} from "react";
import {Fontisto} from "@expo/vector-icons"

const {width: SCREEN_WIDTH} = Dimensions.get("window");
const API_KEY = "eb02dba5ecbbb8192e10ae9ffe63be62";

const icons = {
    Clouds: 'cloudy',
    Clear: 'day-sunny',
    Rain: 'rains',
    Snow: 'snow',
    Drizzle: 'rain',
    Thunderstorm: 'lightning',
    Atmosphere: 'cloudy-gusts',

}

export default function App() {
    const [cityState, setCity] = useState("Loading..");
    const [days, setDays] = useState([]);
    const [permissionState, setPermission] = useState(true);

    const getWeather = async () => {
        const {granted} = await Location.requestForegroundPermissionsAsync();
        if (!granted) {
            setPermission(false);
        }

        const {latitude, longitude} = (await Location.getCurrentPositionAsync({accuracy: 5})).coords;
        const location = await Location.reverseGeocodeAsync({latitude, longitude}, {useGoogleMaps: false});
        setCity(location[0].city);
        //제외하고 싶은 부분은 &exclude={part}에 넣는다. 맨 마지막에 &units=metric를 넣어야 한국에서 쓰는 섭씨 체계로 온도가 출력된다.
        const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely,alerts&appid=${API_KEY}&units=metric`)
        const json = await response.json();
        setDays(json.daily);
    };

    useEffect(() => {
        getWeather();
    }, [])

    return (
        <>
            {!permissionState ? (
                <View style={{...styles.container, ...styles.city}}>
                    <Text style={{fontSize: 40}}>🌧️🌧️🌧️🌧️🌧️🌧️🌧️</Text>
                    <Text style={{...styles.cityName, fontSize: 40, textAlign: 'center'}}>Permission to access location
                        was denied.</Text>
                </View>
            ) : (
                <View style={styles.container}>
                    <View style={styles.city}>
                        <Text style={styles.cityName}>{cityState}</Text>
                    </View>
                    <ScrollView
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        horizontal
                        contentContainerstyle={styles.weather}>
                        {days.length === 0 ? (
                            <View style={styles.day}>
                                <ActivityIndicator color={'white'} size={'large'}/>
                            </View>
                        ) : (
                            days.map((day, index) => (
                                <View key={index} style={styles.day}>
                                    <Text
                                        style={styles.dayTime}>{new Date(day.dt * 1000).toString().substring(0, 10).toUpperCase()}</Text>
                                    <View style={styles.tempSection}>
                                        <Text style={styles.temperature}>{parseFloat(day.temp.day).toFixed(1)}</Text>
                                        <Fontisto name={icons[day.weather[0].main]} size={88} color={'white'}
                                                  style={styles.icon}/>
                                    </View>
                                    <Text style={styles.mainDes}>{day.weather[0].main.toUpperCase()}</Text>
                                    <Text style={styles.subDes}>{day.weather[0].description}</Text>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "blue",
    },
    city: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cityName: {
        color: '#0F0',
        fontSize: 52,
        fontWeight: '500',
    },
    day: {
        width: SCREEN_WIDTH,
        alignItems: 'left',
        paddingLeft: 24,
    },
    dayTime: {
        fontSize: 36,
        color: '#ccc',
    },
    tempSection: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    temperature: {
        marginTop: 24,
        marginLeft: -8,
        fontSize: 140,
        color: '#0F0',
    },
    icon: {
        marginTop: 24,
        padding: 15,
    },
    mainDes: {
        marginTop: 120,
        fontSize: 64,
        color: 'white',
    },
    subDes: {
        marginTop: 4,
        fontSize: 40,
        color: '#ccc',
    },
})