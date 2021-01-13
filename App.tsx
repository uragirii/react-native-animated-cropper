/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export type Status =
  | 'TL'
  | 'T'
  | 'TR'
  | 'R'
  | 'BR'
  | 'B'
  | 'BL'
  | 'L'
  | 'INSIDE'
  | 'NA';

export type Context = {
  offsetX: number;
  offsetY: number;
  status: Status;
  width: number;
  height: number;
};

const THRESHOLD = 30;
const BOX_WIDTH = 100;

const App = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const boxWidth = useSharedValue(BOX_WIDTH);
  const boxHeight = useSharedValue(BOX_WIDTH);

  const onGestureEvent = useAnimatedGestureHandler({
    onStart: (event, ctx: Context) => {
      ctx.offsetX = translateX.value;
      ctx.offsetY = translateY.value;
      ctx.width = boxWidth.value;
      ctx.height = boxHeight.value;
      // check here if touch is inside or outside
      const currWidth = boxWidth.value;
      const currHeight = boxHeight.value;
      const threshold = THRESHOLD;
      const {x, y} = event;
      let status: Status;
      if (x < threshold && y < threshold) {
        status = 'TL';
      } else if (y < threshold && x > threshold && x < currWidth - threshold) {
        status = 'T';
      } else if (y < threshold && x > currWidth - threshold) {
        status = 'TR';
      } else if (x < threshold && y > currHeight - threshold) {
        status = 'BL';
      } else if (
        y > currHeight - threshold &&
        x > threshold &&
        x < currWidth - threshold
      ) {
        status = 'B';
      } else if (x > currWidth - threshold && y > currHeight - threshold) {
        status = 'BR';
      } else if (x < threshold && y > threshold && y < currHeight - threshold) {
        status = 'L';
      } else if (
        x > currWidth - threshold &&
        y > threshold &&
        y < currHeight - threshold
      ) {
        status = 'R';
      } else if (
        x > threshold &&
        x < currWidth - threshold &&
        y > threshold &&
        y < currHeight - threshold
      ) {
        status = 'INSIDE';
      } else {
        status = 'NA';
      }
      ctx.status = status;
      console.log(status, x, y);
    },

    onActive: (event, ctx: Context) => {
      const {status, offsetX, offsetY, width, height} = ctx;
      if (status.includes('R')) {
        boxWidth.value = width + event.translationX;
      }
      if (status.includes('L')) {
        boxWidth.value = width - event.translationX;
        translateX.value = offsetX + event.translationX;
      }
      if (status.includes('B')) {
        translateY.value = offsetY + event.translationY / 2;
        boxHeight.value = height + event.translationY;
      }
      if (status.includes('T')) {
        translateY.value = offsetY + event.translationY / 2;
        boxHeight.value = height - event.translationY;
      }
      if (status === 'INSIDE') {
        translateY.value = offsetY + event.translationY;
        translateX.value = offsetX + event.translationX;
      }
    },
  });

  const animatedStyles = useAnimatedStyle(() => {
    return {
      width: boxWidth.value,
      height: boxHeight.value,
      margin: THRESHOLD,
      padding: THRESHOLD,
      position: 'relative',
      backgroundColor: 'rgba(0,0,0,0.05)',
      transform: [
        {translateX: translateX.value},
        {translateY: translateY.value},
      ],
    };
  });
  return (
    <View style={styles.container}>
      <PanGestureHandler {...{onGestureEvent}}>
        <Animated.View style={animatedStyles}>
          <View style={{...styles.circle, top: -10, left: -10}} />
          <View style={{...styles.circle, bottom: -10, left: -10}} />
          <View style={{...styles.circle, bottom: -10, right: -10}} />
          <View style={{...styles.circle, top: -10, right: -10}} />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 10,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  circle: {
    width: 20,
    height: 20,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 10,
    position: 'absolute',
    backgroundColor: '#5650F8',
  },
});

export default App;
