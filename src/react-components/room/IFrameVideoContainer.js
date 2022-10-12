import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { IFrameVideoModal } from "./IFrameVideoModal";
import configs from "../../utils/configs";
import ducky from "../../assets/models/DuckyMesh.glb";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function IFrameVideoContainer({ scene, onClose }) {
  const onSubmit = useCallback(
    ({ file, url }) => {
      scene.emit("add_media", (file && file.length > 0 && file[0]) || url || ducky);
      onClose();
    },
    [scene, onClose]
  );

  return (
    <IFrameVideoModal
      isMobile={isMobile}
      showModelCollectionLink={configs.feature("show_model_collection_link")}
      modelCollectionUrl={configs.link("model_collection", "https://sketchfab.com/mozillareality")}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
}

IFrameVideoContainer.propTypes = {
  scene: PropTypes.object.isRequired,
  onClose: PropTypes.func
};
