/* eslint-disable react-native/no-inline-styles */
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {View, StyleSheet, Image as ImageComp, Dimensions} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Canvas, {Image as CanvasImage} from 'react-native-canvas';

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
// const HEIGHT = Dimensions.get('screen').height;
const WIDTH = Dimensions.get('screen').width;

export type ImageCropperProps = {
  url: string;
};

export type ImageCropper = {
  getCroppedData: () => Promise<{data: string; height: number; width: number}>;
};

const ImageCropperComponent = forwardRef<ImageCropper, ImageCropperProps>(
  ({url}, ref?) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const boxWidth = useSharedValue(BOX_WIDTH);
    const boxHeight = useSharedValue(BOX_WIDTH);
    const [imageHeight, setImageHeight] = useState<number>(0);
    const canvasRef = useRef<Canvas>(null);
    const [canvasImage, setCanvasImage] = useState<CanvasImage>(null);
    const [scale, setScale] = useState({scaleX: 0, scaleY: 0});
    useEffect(() => {
      if (canvasRef.current) {
        canvasRef.current.height = 0;
        canvasRef.current.width = 0;
        // const context = canvasRef.current.getContext('2d');
        const image = new CanvasImage(canvasRef.current);
        image.crossOrigin = '';
        image.addEventListener('load', () => {
          const {height, width} = image;
          const ratio = height / width;
          const scaleX = WIDTH / width;
          const scaleY = (ratio * WIDTH) / height;
          setScale({scaleX, scaleY});
          setImageHeight(ratio * WIDTH);
          // image.width = WIDTH;
          // image.height = ratio * WIDTH;
          setCanvasImage(image);
        });
        image.src = url;
      }
    }, [url]);

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
        } else if (
          y < threshold &&
          x > threshold &&
          x < currWidth - threshold
        ) {
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
        } else if (
          x < threshold &&
          y > threshold &&
          y < currHeight - threshold
        ) {
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
      },

      onActive: (event, ctx: Context) => {
        const {status, offsetX, offsetY, width, height} = ctx;
        if (status.includes('R')) {
          // If Width is changing, max possible is x + width
          boxWidth.value =
            width + event.translationX + offsetX > WIDTH
              ? WIDTH - offsetX
              : width + event.translationX;
        }
        if (status.includes('L')) {
          boxWidth.value = width - event.translationX;
          translateX.value =
            offsetX + event.translationX < 0 ? 0 : offsetX + event.translationX;
        }
        if (status.includes('B')) {
          boxHeight.value =
            height + event.translationY + offsetY > imageHeight
              ? imageHeight - offsetY
              : height + event.translationY;
        }
        if (status.includes('T')) {
          // In this case transY would be negative
          if (offsetY + event.translationY < 0) {
            translateY.value = 0;
          } else {
            translateY.value = offsetY + event.translationY;
            boxHeight.value = height - event.translationY;
          }
        }
        if (status === 'INSIDE') {
          translateY.value =
            offsetY + event.translationY < 0
              ? 0
              : offsetY + event.translationY + height > imageHeight
              ? imageHeight - height
              : offsetY + event.translationY;
          translateX.value =
            offsetX + event.translationX < 0
              ? 0
              : offsetX + event.translationX + width > WIDTH
              ? WIDTH - width
              : offsetX + event.translationX;
        }
      },
    });

    const animatedStyles = useAnimatedStyle(() => {
      return {
        width: boxWidth.value,
        height: boxHeight.value,
        margin: THRESHOLD,
        padding: THRESHOLD,
        position: 'absolute',
        top: -THRESHOLD,
        left: -THRESHOLD,
        backgroundColor: 'rgba(0,0,0,0.3)',
        transform: [
          {translateX: translateX.value},
          {translateY: translateY.value},
        ],
      };
    });

    useImperativeHandle(ref, () => ({
      getCroppedData(): Promise<{data: string; height: number; width: number}> {
        return new Promise((resolve, reject) => {
          if (canvasRef.current) {
            canvasRef.current.width = boxWidth.value;
            canvasRef.current.height = boxHeight.value;
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, boxWidth.value, boxHeight.value);
            const {scaleX, scaleY} = scale;
            ctx.drawImage(
              canvasImage,
              translateX.value / scaleX,
              translateY.value / scaleY,
              boxWidth.value / scaleX,
              boxHeight.value / scaleY,
              0,
              0,
              boxWidth.value,
              boxHeight.value,
            );
            canvasRef.current.toDataURL().then((s) => {
              // S contains " " quotes as first and last character of string, idk why
              resolve({
                data: s.substring(1, s.length - 1),
                height: boxHeight.value,
                width: boxWidth.value,
              });
            });
          } else {
            reject('Crop data called before image is loaded');
          }
        });
      },
    }));

    return (
      <>
        <View style={{...styles.container, height: imageHeight}}>
          <Canvas
            ref={canvasRef}
            style={{backgroundColor: 'white', opacity: 0}}
          />
          <ImageComp
            source={{uri: url}}
            style={{
              height: imageHeight,
              width: WIDTH,
              position: 'absolute',
              left: 0,
            }}
          />

          <PanGestureHandler {...{onGestureEvent}}>
            <Animated.View style={animatedStyles}>
              <View style={{...styles.circle, top: -10, left: -10}} />
              <View style={{...styles.circle, bottom: -10, left: -10}} />
              <View style={{...styles.circle, bottom: -10, right: -10}} />
              <View style={{...styles.circle, top: -10, right: -10}} />
            </Animated.View>
          </PanGestureHandler>
        </View>
      </>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    position: 'relative',
    width: WIDTH,
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

export default ImageCropperComponent;
