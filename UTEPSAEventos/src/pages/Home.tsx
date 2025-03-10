import React from 'react';
import BottomNavigator from '../components/BottomNavigator';

const Home = ({ route, navigation }: any) => {
  return <BottomNavigator route={route} navigation={navigation} />;
};

export default Home;
