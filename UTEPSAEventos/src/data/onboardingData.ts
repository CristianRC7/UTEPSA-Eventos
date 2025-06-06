import { OnboardingData } from '../types/OnboardingTypes';

const onboardingData: OnboardingData[] = [
  {
    id: 1,
    animation: require('../assets/animations/Lottie1.json'),
    text: '¡Bienvenido a la aplicación UTEPSA Eventos!',
    textColor: '#23395d',
    backgroundColor: '#e9eef6',
  },
  {
    id: 2,
    animation: require('../assets/animations/Lottie2.json'),
    text: 'Infórmate de los eventos de UTEPSA y comparte tus momentos',
    textColor: '#23395d',
    backgroundColor: '#c7d2fe',
  },
  {
    id: 3,
    animation: require('../assets/animations/Lottie3.json'),
    text: '¿Comenzamos?',
    textColor: '#23395d',
    backgroundColor: '#f1f5f9',
  },
];

export default onboardingData;
