'use strict';

import React, {
  Component
} from 'react';

import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Video from 'react-native-video';

export default class VideoPlayer extends Component {

  state = {
    rate: 1,
    volume: 1,
    muted: false,
    resizeMode: 'contain',
    duration: 0.0,
    currentTime: 0.0,
    paused: true,
  };

  video: Video;

  onLoad = (data) => {
    this.setState({ duration: data.duration });
  };

  onProgress = (data) => {
    this.setState({ currentTime: data.currentTime });
  };

  onEnd = () => {
    this.setState({ paused: true })
    this.video.seek(0)
  };

  render() {

    return (
      <View style={styles.container}>
      <StatusBar hidden={true} />
        <TouchableOpacity
          style={styles.fullScreen}
          onPress={() => this.setState({ paused: !this.state.paused })}
        >
          <Video
            ref={(ref: Video) => { this.video = ref }}
            //  source={{ uri: 'http://www.youtube.com/api/manifest/dash/id/bf5bb2419360daf1/source/youtube?as=fmp4_audio_clear,fmp4_sd_hd_clear&sparams=ip,ipbits,expire,source,id,as&ip=0.0.0.0&ipbits=0&expire=19000000000&signature=51AF5F39AB0CEC3E5497CD9C900EBFEAECCCB5C7.8506521BFC350652163895D4C26DEE124209AA9E&key=ik0', type: 'mpd' }} 
            source={require('./broadchurch.mp4')}
            style={styles.fullScreen}
            rate={this.state.rate}
            paused={this.state.paused}
            volume={this.state.volume}
            muted={this.state.muted}
            resizeMode={this.state.resizeMode}
            onLoad={this.onLoad}
            onProgress={this.onProgress}
            onEnd={this.onEnd}
            repeat={true}
          />
        </TouchableOpacity>
        
        <Text>10.0</Text>


      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
      backgroundColor: '#000',
      flex: 1,
      alignSelf: 'stretch',
      justifyContent: 'space-between',
  },
  fullScreen: {
      overflow: 'hidden',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
  },

});