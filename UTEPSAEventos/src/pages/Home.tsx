import React from 'react';
import BottomNavigator from '../components/BottomNavigator';

interface HomeProps {
  route: any;
  navigation: any;
}

const Home: React.FC<HomeProps> = ({ route, navigation }) => {
  return <BottomNavigator route={route} navigation={navigation} />;
};

export default Home;