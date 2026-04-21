import React, { useState, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import Cropper from "react-easy-crop";
import { GrRotateLeft, GrRotateRight } from "react-icons/gr";

const ImageEditorModal = ({
  show,
  handleClose,
  selectedImage,
  onDelete,
  setImage,
  setcroppedImage,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const rotateLeft = () => setRotation(rotation - 90);
  const rotateRight = () => setRotation(rotation + 90);

  const createCroppedImage = useCallback(async () => {
    const image = new Image();
    image.src = selectedImage;

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        const croppedImageUrl = canvas.toDataURL("image/jpeg");
        resolve(croppedImageUrl);
      };
    });
  }, [selectedImage, croppedAreaPixels]);

  const handleApply = async () => {
    try {
      const croppedImage = await createCroppedImage();
      setCroppedImageUrl(croppedImage);
      setcroppedImage(croppedImage);
      setImage(croppedImage);
      handleClose();
    } catch (error) {
      console.error("Error cropping the image:", error);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="md"
      className="image-editor-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Banner</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          className="crop-container"
          style={{ width: "100%", height: "40vh" }}
        >
          <Cropper
            image={selectedImage}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={4 / 1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            style={{ containerStyle: { width: "100%", height: "100%" } }}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="rotation-controls col-lg-12 col-md-12 d-flex justify-content-end gap-2 mt-4">
          <button className="custom-button" onClick={rotateLeft}>
            <GrRotateRight className="icon" />
          </button>
          <button className="custom-button" onClick={rotateRight}>
            <GrRotateLeft className="icon" />
          </button>
        </div>
        <div className="controls">
          <div className="control-group">
            <label>Zoom</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
            />
          </div>
          <div className="control-group">
            <label>Straighten</label>
            <input
              type="range"
              min="-45"
              max="45"
              step="1"
              value={rotation}
              onChange={(e) => setRotation(e.target.value)}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="banner-footer">
        <Button variant="danger" onClick={onDelete}>
          Delete Photo
        </Button>
        <div className="d-flex gap-3">
          <Button variant="secondary" onClick={handleClose}>
            Change Photo
          </Button>
          <Button variant="primary" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageEditorModal;
