import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import {BarCodeScanner} from 'expo-barcode-scanner'
import { Ionicons } from '@expo/vector-icons'; 
import api from './api';

/**
 * 
 * @param {{barcodeScanned: function, closeCameraView: function}} props 
 */
export default function CameraView(props) {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const handleBarcodeScanned = async (e) => {
    props.closeCameraView();
    props.barcodeScanned(e.data);
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} type={type} barCodeScannerSettings={{
            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
          }} onBarCodeScanned={handleBarcodeScanned}>
        <View
          style={{
            flex: 2,
            backgroundColor: 'transparent',
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            style={{...styles.cameraButton, marginRight: 15}}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <Ionicons name="ios-reverse-camera" size={40} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => props.closeCameraView() }>
            <Ionicons name="ios-close" size={40} color="white" />
          </TouchableOpacity>

        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraButton: {
    //backgroundColor: "rgba(255,255,255,0.25)",
    //borderRadius: 5,
    marginHorizontal: 15,
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
  },
  cameraButtonText: { fontSize: 18, color: 'white' }

})
