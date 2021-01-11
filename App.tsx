/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  Dimensions,
  View,
  GestureResponderEvent,
} from 'react-native';
import Canvas from 'react-native-canvas';
import ICanvas from './node_modules/@types/react-native-canvas';
import {
  BasicRect,
  isInsideRectangle,
  isOnEdge,
  isOnVertex,
  redrawCanvas,
} from './utils';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

export type MouseType =
  | 'INSIDE'
  | 'OUTSIDE'
  | 'T'
  | 'B'
  | 'L'
  | 'R'
  | 'TR'
  | 'TL'
  | 'BR'
  | 'BL';

const App = () => {
  const canvas = useRef<ICanvas>();
  const [mainRectangle, setMainRectangle] = useState<BasicRect>({
    x0: WIDTH / 2,
    x1: WIDTH / 2 + 50,
    y0: HEIGHT / 2,
    y1: HEIGHT / 2 + 50,
  });
  const [mouse, setMouse] = useState<MouseType>('OUTSIDE');
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevMouse, setPrevMouse] = useState<{x: number; y: number}>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    canvas.current.height = HEIGHT;
    canvas.current.width = WIDTH;
  }, []);

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');

    redrawCanvas(
      ctx,
      canvas.current.width,
      canvas.current.height,
      mainRectangle,
    );
  }, [mainRectangle]);

  const mouseDown = (e: GestureResponderEvent) => {
    const mouseX = e.nativeEvent.locationX;
    const mouseY = e.nativeEvent.locationY;
    if (isInsideRectangle(mouseX, mouseY, mainRectangle)) {
      setMouse('INSIDE');
    } else if (isInsideRectangle(mouseX, mouseY, mainRectangle)) {
      setMouse('OUTSIDE');
    } else if (isOnVertex(mouseX, mouseY, mainRectangle)) {
      setMouse(isOnVertex(mouseX, mouseY, mainRectangle));
    } else if (isOnEdge(mouseX, mouseY, mainRectangle)) {
      setMouse(isOnEdge(mouseX, mouseY, mainRectangle));
    }
    setIsDrawing(true);
    setPrevMouse({x: mouseX, y: mouseY});
  };

  const mouseMove = (e: GestureResponderEvent) => {
    const ctx = canvas.current.getContext('2d');

    if (mouse !== 'OUTSIDE' && isDrawing) {
      const mouseX = e.nativeEvent.locationX;
      const mouseY = e.nativeEvent.locationY;
      const MAIN_RECTANGLE = {...mainRectangle};
      const PREV_MOUSE = {...prevMouse};
      if (mouse === 'T') {
        MAIN_RECTANGLE.y0 += mouseY - PREV_MOUSE.y;
        PREV_MOUSE.y = mouseY;
      } else if (mouse === 'R') {
        MAIN_RECTANGLE.x1 += mouseX - PREV_MOUSE.x;
        PREV_MOUSE.x = mouseX;
      } else if (mouse === 'B') {
        MAIN_RECTANGLE.y1 += mouseY - PREV_MOUSE.y;
        PREV_MOUSE.y = mouseY;
      } else if (mouse === 'L') {
        MAIN_RECTANGLE.x0 += mouseX - PREV_MOUSE.x;
        PREV_MOUSE.x = mouseX;
      } else if (mouse === 'TL') {
        MAIN_RECTANGLE.x0 += mouseX - PREV_MOUSE.x;
        PREV_MOUSE.x = mouseX;
        MAIN_RECTANGLE.y0 += mouseY - PREV_MOUSE.y;
        PREV_MOUSE.y = mouseY;
      } else if (mouse === 'TR') {
        MAIN_RECTANGLE.x1 += mouseX - PREV_MOUSE.x;
        PREV_MOUSE.x = mouseX;
        MAIN_RECTANGLE.y0 += mouseY - PREV_MOUSE.y;
        PREV_MOUSE.y = mouseY;
      } else if (mouse === 'BL') {
        MAIN_RECTANGLE.y1 += mouseY - PREV_MOUSE.y;
        PREV_MOUSE.y = mouseY;
        MAIN_RECTANGLE.x0 += mouseX - PREV_MOUSE.x;
        PREV_MOUSE.x = mouseX;
      } else if (mouse === 'BR') {
        MAIN_RECTANGLE.y1 += mouseY - PREV_MOUSE.y;
        PREV_MOUSE.y = mouseY;
        MAIN_RECTANGLE.x1 += mouseX - PREV_MOUSE.x;
        PREV_MOUSE.x = mouseX;
      } else if (mouse === 'INSIDE') {
        MAIN_RECTANGLE.x0 += mouseX - PREV_MOUSE.x;
        MAIN_RECTANGLE.y0 += mouseY - PREV_MOUSE.y;
        MAIN_RECTANGLE.y1 += mouseY - PREV_MOUSE.y;
        MAIN_RECTANGLE.x1 += mouseX - PREV_MOUSE.x;

        PREV_MOUSE.y = mouseY;
        PREV_MOUSE.x = mouseX;
      }
      setMainRectangle(MAIN_RECTANGLE);
      setPrevMouse(PREV_MOUSE);
      redrawCanvas(
        ctx,
        canvas.current.width,
        canvas.current.height,
        MAIN_RECTANGLE,
      );
    }
  };
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{backgroundColor: 'black'}}>
        <View
          onTouchStart={mouseDown}
          onTouchMove={mouseMove}
          onTouchEnd={() => setIsDrawing(false)}>
          <Canvas ref={canvas} style={{backgroundColor: 'white'}} />
        </View>
      </SafeAreaView>
    </>
  );
};

export default App;
