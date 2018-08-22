import React, { Component } from 'react';
import Video from 'react-native-video';
import {
    TouchableWithoutFeedback,
    TouchableHighlight,
    ImageBackground,
    StyleSheet,
    StatusBar,
    Animated,
    Easing,
    Image,
    View,
    Text,
    PermissionsAndroid,
    Slider
} from 'react-native';
import _ from 'lodash';

const PlayList = ['/storage/emulated/0/Video/Alan Walker - Faded.mp4', '/storage/emulated/0/Video/Dil Meri Na Sune Song Video - Genius _ Utkarsh, Ishita _ Atif Aslam _ Himesh Reshammiya _ Manoj.mp4', '/storage/emulated/0/Video/Titanic Theme Song • My Heart Will Go On • Celine Dion HD.mp4', '/storage/emulated/0/Video/Tera Fitoor Song Video - Genius _ Utkarsh Sharma, Ishita Chauhan _ Arijit Singh _Himesh Reshammiya.mp4'];

export default class VideoPlayer extends Component {
    _playIndex = null;

    static defaultProps = {
        toggleResizeModeOnFullscreen:   true,
        playInBackground:               false,
        playWhenInactive:               false,
        showOnStart:                    true,
        resizeMode:                     'contain',
        paused:                         true,
        repeat:                         false,
        volume:                         1,
        muted:                          false,
        title:                          '',
        rate:                           1,
    };

    constructor( props ) {
        super( props );
        this.state = {
            resizeMode: this.props.resizeMode,
            paused: this.props.paused,
            muted: this.props.muted,
            volume: this.props.volume,
            rate: this.props.rate,

            isFullscreen: this.props.resizeMode === 'cover' || false,
            showTimeRemaining: true,
            lastScreenPress: 0,
            seeking: false,
            loading: false,
            currentTime: 0,
            error: false,
            duration: 0,
            play: ''
        };

        this.opts = {
            playWhenInactive: this.props.playWhenInactive,
            playInBackground: this.props.playInBackground,
            repeat: this.props.repeat,
            title: this.props.title,
        };

        this.events = {
            onError: this.props.onError || this._onError.bind( this ),
            onBack: this.props.onBack || this._onBack.bind( this ),
            onEnd: this.props.onEnd || this._onEnd.bind( this ),
            onEnterFullscreen: this.props.onEnterFullscreen,
            onExitFullscreen: this.props.onExitFullscreen,
            onLoadStart: this._onLoadStart.bind( this ),
            onLoad: this._onLoad.bind( this ),
            onPause: this.props.onPause,
            onPlay: this.props.onPlay,
        };

        this.methods = {
            toggleFullscreen: this._toggleFullscreen.bind( this ),
            togglePlayPause: this._togglePlayPause.bind( this ),
            toggleTimer: this._toggleTimer.bind( this ),
        };

        const initialValue = this.props.showOnStart ? 1 : 0;

        this.animations = {
            bottomControl: {
                marginBottom: new Animated.Value( 0 ),
                opacity: new Animated.Value( initialValue ),
            },
            topControl: {
                marginTop: new Animated.Value( 0 ),
                opacity: new Animated.Value( initialValue ),
            },
            video: {
                opacity: new Animated.Value( 1 ),
            },
            loader: {
                rotate: new Animated.Value( 0 ),
                MAX_VALUE: 360,
            }
        };

        this.styles = {
            videoStyle: this.props.videoStyle || {},
            containerStyle: this.props.style || {}
        };
    }

    _onLoadStart() {
        let state = this.state;
        state.loading = true;
        this.loadAnimation();
        this.setState( state );

        if ( typeof this.props.onLoadStart === 'function' ) {
            this.props.onLoadStart(...arguments);
        }
    }

    _onLoad = (data) => {
        let state = this.state;

        state.duration = data.duration;
        state.loading = false;
        this.setState( state );

        if ( state.showControls ) {
            this.setControlTimeout();
        }

        if ( typeof this.props.onLoad === 'function' ) {
            this.props.onLoad(...arguments);
        }
    }

    _onProgress = (data) => {
        this.setState({ currentTime: data.currentTime});
    }

    _onEnd() {
        this._nextPlay();
    }

    _onError( err ) {
        let state = this.state;
        state.error = true;
        state.loading = false;

        this.setState( state );
    }

    loadAnimation() {
        if ( this.state.loading ) {
            Animated.sequence([
                Animated.timing(
                    this.animations.loader.rotate,
                    {
                        toValue: this.animations.loader.MAX_VALUE,
                        duration: 1500,
                        easing: Easing.linear,
                    }
                ),
                Animated.timing(
                    this.animations.loader.rotate,
                    {
                        toValue: 0,
                        duration: 0,
                        easing: Easing.linear,
                    }
                ),
            ]).start( this.loadAnimation.bind( this ) );
        }
    }

    _toggleFullscreen() {
        let state = this.state;

        state.isFullscreen = ! state.isFullscreen;

        if (this.props.toggleResizeModeOnFullscreen) {
            state.resizeMode = state.isFullscreen === true ? 'cover' : 'contain';
        }

        if (state.isFullscreen) {
            typeof this.events.onEnterFullscreen === 'function' && this.events.onEnterFullscreen();
        }
        else {
            typeof this.events.onExitFullscreen === 'function' && this.events.onExitFullscreen();
        }

        this.setState( state );
    }

    _togglePlayPause() {
        let state = this.state;
        state.paused = !state.paused;

        if (state.paused) {
            typeof this.events.onPause === 'function' && this.events.onPause();
        }
        else {
            typeof this.events.onPlay === 'function' && this.events.onPlay();
        }

        this.setState( state );
    }

    _toggleTimer() {
        let state = this.state;
        state.showTimeRemaining = ! state.showTimeRemaining;
        this.setState( state );
    }

    _onBack() {
        alert("Back Does't initialize...!");
    }

    calculateTime() {
        if ( this.state.showTimeRemaining ) {
            const time = this.state.duration - this.state.currentTime;
            return `-${ this.formatTime( time ) }`;
        }

        return this.formatTime( this.state.currentTime );
    }

    formatTime( time = 0 ) {
        const symbol = this.state.showRemainingTime ? '-' : '';
        time = Math.min(
            Math.max( time, 0 ),
            this.state.duration
        );

        const formattedMinutes = _.padStart( Math.floor( time / 60 ).toFixed( 0 ), 2, 0 );
        const formattedSeconds = _.padStart( Math.floor( time % 60 ).toFixed( 0 ), 2 , 0 );

        return `${ symbol }${ formattedMinutes }:${ formattedSeconds }`;
    }

    _nextPlay() {
        let current = this._playIndex;
        if (PlayList.length <= current + 1) {
            this._playIndex = PlayList.length - 1;
        } else {
            this._playIndex = current + 1;
        }
        this.setState({
            play: PlayList[this._playIndex],
        });
    }

    _previousPlay() {
        let current = this._playIndex;
        if (current === 0) {
            this._playIndex = 0;
        } else {
            this._playIndex = current - 1;
        }
        this.setState({
            play: PlayList[this._playIndex]
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.paused !== nextProps.paused ) {
            this.setState({
                paused: nextProps.paused
            })
        }
    }

    componentDidMount() {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
    }

    componentWillMount(){
        this.setState({
            play: PlayList[0]
        });
        this._playIndex = 0;
    }

    renderControl( children, callback, style = {} ) {
        return (
            <TouchableHighlight
                underlayColor="transparent"
                activeOpacity={ 0.3 }
                onPress={()=>{
                    callback();
                }}
                style={[
                    styles.controls.control,
                    style
                ]}
            >
                { children }
            </TouchableHighlight>
        );
    }

    renderNullControl() {
        return (
            <View style={[ styles.controls.control ]} />
        );
    }

    renderTopControls() {

        const backControl = this.props.disableBack ? this.renderNullControl() : this.renderBack();
        const fullscreenControl = this.props.disableFullscreen ? this.renderNullControl() : this.renderFullscreen();

        return(
            <Animated.View style={[
                styles.controls.top,
                {
                    opacity: this.animations.topControl.opacity,
                    marginTop: this.animations.topControl.marginTop,
                }
            ]}>
                <ImageBackground
                    source={ require( './assets/img/top-vignette.png' ) }
                    style={[ styles.controls.column ]}
                    imageStyle={[ styles.controls.vignette ]}>
                    <View style={ styles.controls.topControlGroup }>
                        { backControl }
                        <View style={ styles.controls.pullRight }>
                            { fullscreenControl }
                        </View>
                    </View>
                </ImageBackground>
            </Animated.View>
        );
    }

    renderBack() {
        return this.renderControl(
            <Image
                source={ require( './assets/img/back.png' ) }
                style={ styles.controls.back }
            />,
            this.events.onBack,
            styles.controls.back
        );
    }

    renderFullscreen() {
        let source = this.state.isFullscreen === true ? require( './assets/img/shrink.png' ) : require( './assets/img/expand.png' );
        return this.renderControl(
            <Image source={ source } />,
            this.methods.toggleFullscreen,
            styles.controls.fullscreen
        );
    }

    renderBottomControls() {
        const timerControl = this.props.disableTimer ? this.renderNullControl() : this.renderTimer();
        const seekbarControl = this.props.disableSeekbar ? this.renderNullControl() : this.renderSeekbar();
        const playPauseControl = this.props.disablePlayPause ? this.renderNullControl() : this.renderPlayPause();
        return(
            <Animated.View style={[
                styles.controls.bottom,
                {
                    opacity: this.animations.bottomControl.opacity,
                    marginBottom: this.animations.bottomControl.marginBottom,
                }
            ]}>
                <ImageBackground
                    source={ require( './assets/img/bottom-vignette.png' ) }
                    style={[ styles.controls.column ]}
                    imageStyle={[ styles.controls.vignette ]}>
                    { seekbarControl }
                    <View style={[
                        styles.controls.row,
                        styles.controls.bottomControlGroup
                    ]}>
                        { playPauseControl }
                        { this.renderTitle() }
                        { timerControl }

                    </View>
                </ImageBackground>
            </Animated.View>
        );
    }

    renderSeekbar() {
        return (
            <Slider
                minimumValue={0}
                maximumValue={this.state.duration}
                thumbTintColor='#FFFFFF'
                minimumTrackTintColor='#FF0000'
                maximumTrackTintColor='#808080'
                step={2}
                onValueChange={val => {
                    this.setState({ paused: true,});
                    this.player.seek(val);
                }}
                onSlidingComplete={val => {
                    this.setState({ currentTime: val, paused: false});
                }}
                value={this.state.currentTime}
                trackStyle={{
                    height: 20,
                }}
                width='90%'
            />
        );
    }

    renderPlayPause() {
        let source = this.state.paused === true ? require( './assets/img/play.png' ) : require( './assets/img/pause.png' );

        return(
            <View style={{ flexDirection: 'row' }}>

                <TouchableHighlight
                    underlayColor="transparent"
                    activeOpacity={0.3}
                    onPress={() => this._previousPlay()}
                    style={[styles.controls.control, styles.controls.playPause]} >
                    <Image source={require('./assets/img/left.png')} style={{ width: 15, height: 15 }} resizeMode='contain' />
                </TouchableHighlight>

                <TouchableHighlight
                    underlayColor="transparent"
                    activeOpacity={0.3}
                    onPress={this.methods.togglePlayPause}
                    style={[styles.controls.control, styles.controls.playPause]} >
                    <Image source={source} />
                </TouchableHighlight>

                <TouchableHighlight
                    underlayColor="transparent"
                    activeOpacity={0.3}
                    onPress={() => this._nextPlay()}
                    style={[styles.controls.control, styles.controls.playPause]} >
                    <Image source={require('./assets/img/right.png')} style={{ width: 15, height: 15 }} resizeMode='contain' />
                </TouchableHighlight>

            </View>
        );
    }

    renderTitle() {
        if ( this.opts.title ) {
            return (
                <View style={[
                    styles.controls.control,
                    styles.controls.title,
                ]}>
                    <Text style={[
                        styles.controls.text,
                        styles.controls.titleText
                    ]} numberOfLines={ 1 }>
                        { this.opts.title || '' }
                    </Text>
                </View>
            );
        }
        return null;
    }

    renderTimer() {
        return this.renderControl(
            <Text style={ styles.controls.timerText }>
                {this.calculateTime()} / {this.formatTime(this.state.duration)}
            </Text>,
            this.methods.toggleTimer,
            styles.controls.timer
        );
    }

    renderLoader() {
        if ( this.state.loading ) {
            return (
                <View style={ styles.loader.container }>
                    <Animated.Image source={ require( './assets/img/loader-icon.png' ) } style={[
                        styles.loader.icon,
                        { transform: [
                            { rotate: this.animations.loader.rotate.interpolate({
                                inputRange: [ 0, 360 ],
                                outputRange: [ '0deg', '360deg' ]
                            })}
                        ]}
                    ]} />
                </View>
            );
        }
        return null;
    }

    renderError() {
        if ( this.state.error ) {
            return (
                <View style={ styles.error.container }>
                    <Image source={ require( './assets/img/error-icon.png' ) } style={ styles.error.icon } />
                    <Text style={ styles.error.text }>
                        Video unavailable
                    </Text>
                </View>
            );
        }
        return null;
    }
    
    render() {
        return (
            <TouchableWithoutFeedback
                style={[ styles.player.container, this.styles.containerStyle ]}
            >
                <View style={[ styles.player.container, this.styles.containerStyle ]}>
                    <StatusBar hidden={true} />
                    <Video
                        { ...this.props }
                        ref={ videoPlayer => this.player = videoPlayer }
                        resizeMode={ this.state.resizeMode }
                        volume={ this.state.volume }
                        paused={ this.state.paused }
                        muted={ this.state.muted }
                        rate={ this.state.rate }
                        onLoadStart={ this.events.onLoadStart }
                        onProgress={this._onProgress }
                        onError={ this.events.onError }
                        onLoad={this._onLoad}
                        onEnd={ this.events.onEnd }
                        style={[ styles.player.video, this.styles.videoStyle ]}
                        source={{ uri: this.state.play}}
                    />
                    { this.renderError() }
                    { this.renderTopControls() }
                    { this.renderLoader() }
                    { this.renderBottomControls() }
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
const styles = {
    player: StyleSheet.create({
        container: {
            backgroundColor: '#000',
            flex: 1,
            alignSelf: 'stretch',
            justifyContent: 'space-between',
        },
        video: {
            overflow: 'hidden',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
    }),
    error: StyleSheet.create({
        container: {
            backgroundColor: 'rgba( 0, 0, 0, 0.5 )',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            justifyContent: 'center',
            alignItems: 'center',
        },
        icon: {
            marginBottom: 16,
        },
        text: {
            backgroundColor: 'transparent',
            color: '#f27474'
        },
    }),
    loader: StyleSheet.create({
        container: {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            alignItems: 'center',
            justifyContent: 'center',
        },
    }),
    controls: StyleSheet.create({
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: null,
            width: null,
        },
        column: {
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: null,
            width: null,
        },
        vignette: {
            resizeMode: 'stretch'
        },
        control: {
            padding: 16,
        },
        text: {
            backgroundColor: 'transparent',
            color: '#FFF',
            fontSize: 14,
            textAlign: 'center',
        },
        pullRight: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        top: {
            flex: 1,
            alignItems: 'stretch',
            justifyContent: 'flex-start',
        },
        bottom: {
            alignItems: 'stretch',
            flex: 2,
            justifyContent: 'flex-end',
        },
        topControlGroup: {
            alignSelf: 'stretch',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
            width: null,
            margin: 12,
            marginBottom: 18,
        },
        bottomControlGroup: {
            alignSelf: 'stretch',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginLeft: 12,
            marginRight: 12,
            marginBottom: 0,
        },
        volume: {
            flexDirection: 'row',
        },
        fullscreen: {
            flexDirection: 'row',
        },
        playPause: {
            position: 'relative',
            width: 50,
            zIndex: 0
        },
        title: {
            alignItems: 'center',
            flex: 0.6,
            flexDirection: 'column',
            padding: 0,
        },
        titleText: {
            textAlign: 'center',
        },
        timer: {
            width: 150,
        },
        timerText: {
            backgroundColor: 'transparent',
            color: '#FFF',
            fontSize: 11,
            textAlign: 'right',
        },
    }),
};