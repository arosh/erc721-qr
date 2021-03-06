// @flow
import React from 'react';
import {
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap';
import jsQR from 'jsqr';
import 'webrtc-adapter';

type Props = {
  modal: boolean,
  toggle: () => void,
  onScan: string => void,
};

type State = {
  cameras: any[],
};

export default class CameraModal extends React.Component<Props, State> {
  state = {
    cameras: [],
  };
  componentDidMount() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error('Cannot use navigator.mediaDevices.enumerateDevices.');
    }
    // https://developer.mozilla.org/ja/docs/Web/API/MediaDevices/enumerateDevices
    // https://qiita.com/massie_g/items/b9863e4366cfed339528
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videoInputs = devices.filter(
        device => device.kind === 'videoinput'
      );
      if (videoInputs.length > 0) {
        this.startCamera(videoInputs[0].deviceId);
      }
      this.setState({
        cameras: videoInputs,
      });
    });
  }
  componentWillUnmount() {
    this.stopCamera();
  }
  stream: ?MediaStream;
  video: ?HTMLVideoElement;
  async startCamera(deviceId: string) {
    this.stopCamera();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Cannot use navigator.mediaDevices.getUserMedia.');
    }
    const constraints = {
      video: {
        deviceId,
      },
    };
    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (!this.video) {
      throw new Error('video element is null.');
    }
    // Firefox では video.play() が必要という情報もあったけどなくても動いた
    // https://qiita.com/geek_duck/items/dc89bdc7123356302483
    this.video.srcObject = this.stream;
    setTimeout(this.tick, 200);
  }
  stopCamera() {
    if (this.stream) {
      this.stream.getVideoTracks().forEach(devise => {
        devise.stop();
      });
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
  }
  tick = () => {
    // stopCamera中でないかどうかの判定
    if (this.video && this.video.srcObject) {
      if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!this.video || !this.video.videoWidth || !this.video.videoHeight) {
          throw new Error('videoWidth or videoHeight is null');
        }
        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        ctx.drawImage(this.video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          this.props.onScan(code.data);
        }
      }
      setTimeout(this.tick, 200);
    }
  };
  render() {
    return (
      <Modal isOpen={this.props.modal}>
        <ModalHeader toggle={this.props.toggle}>Scan QR code</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="cameraSelect">Camera</Label>
            <Input
              type="select"
              id="cameraSelect"
              onChange={e => this.startCamera(e.target.value)}
            >
              {this.state.cameras.map(camera => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label || '(Unknown)'}
                </option>
              ))}
            </Input>
          </FormGroup>
          <video
            width="100%"
            autoPlay /* これを指定しないと連続的に読み込まれない (Chrome) */
            playsInline /* これを指定しないとiOSでフルスクリーンになってしまう */
            ref={e => {
              this.video = e;
            }}
            className="border rounded"
          />
        </ModalBody>
      </Modal>
    );
  }
}
