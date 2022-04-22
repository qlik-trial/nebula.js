import React from 'react';
import { View, StyleSheet, Image, Pressable, Text } from 'react-native';
import AppTemplate from './AppTemplate';
import SupernovaView from './SupernovaView';

const titleImage = require('../assets/images/nebulaLogo.png');

const styles = StyleSheet.create({
  viewer: {
    flex: 1,
    padding: 20,
    margin: 20,
    backgroundColor: '#FFFFFF',
  },
  titleImage: {
    width: '100%',
    height: 100,
  },
  backButtonContainer: {
    backgroundColor: 'yellow',
  },
});

const SupernovaViewer = ({ navigation, route }) => {
  const goBack = () => {
    route.params.connection.app.session.close();
    navigation.navigate('EngineConnectView');
  };

  return (
    <AppTemplate>
      <Image style={styles.titleImage} source={titleImage} />
      <View style={styles.backButtonContainer}>
        <Pressable onPress={() => goBack()}>
          <Text>Go Back</Text>
        </Pressable>
      </View>
      <View style={styles.viewer}>
        <SupernovaView
          connection={route.params.connection}
          fields={['Dim1']}
          measures={['Sum([Expression1])']}
          fullScreen={false}
        />
      </View>
    </AppTemplate>
  );
};

export default SupernovaViewer;