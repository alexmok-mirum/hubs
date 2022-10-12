import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ReactComponent as PenIcon } from "../icons/Pen.svg";
import { ReactComponent as CameraIcon } from "../icons/Camera.svg";
// import { ReactComponent as TextIcon } from "../icons/Text.svg";
// import { ReactComponent as LinkIcon } from "../icons/Link.svg";
import { ReactComponent as GIFIcon } from "../icons/GIF.svg";
import { ReactComponent as ObjectIcon } from "../icons/Object.svg";
import { ReactComponent as AvatarIcon } from "../icons/Avatar.svg";
import { ReactComponent as SceneIcon } from "../icons/Scene.svg";
import { ReactComponent as UploadIcon } from "../icons/Upload.svg";
import { PlacePopoverButton } from "./PlacePopover";
import { ObjectUrlModalContainer } from "./ObjectUrlModalContainer";
import { IFrameVideoContainer } from "./IFrameVideoContainer";
import configs from "../../utils/configs";
import { FormattedMessage } from "react-intl";
import { anyEntityWith } from "../../utils/bit-utils";
import { MyCameraTool } from "../../bit-components";

/// Add Gen Bear with btn
var inited = false;
let bridgeFunction;

function InitBear(){
  AFRAME.registerComponent("clickable-bear", {
    init() {
        this.bornbtn = this.el.querySelector(".next-button [text-button]");
        this.bornbtn?.object3D?.addEventListener("interact", createBear)
    }
  });
  inited = true;
}

function clickAbleBear(){
  if(!inited){
    InitBear();
  }
  var el = document.createElement("a-entity")
  el.setAttribute("clickableBear","");
  AFRAME.scenes[0].appendChild(el)
  el.setAttribute("id","bear")
  el.setAttribute("tags", { singleActionButton: true });
  el.setAttribute("media-loader", { src: "https://mirummre.blob.core.windows.net/glb/bear.glb", fitToBox: true, resolve: true })
  el.setAttribute("networked", { template: "#interactable-media" } )
  el.setAttribute("clickable-bear","");
  console.log(Object.keys(el));
  console.log(Object.keys(el.object3D));
  var el = document.createElement("a-entity")
  let menuEntity = document.createElement("a-entity");
  menuEntity.setAttribute("visible", "true");
  menuEntity.innerHTML = "<a-entity class='next-button' position='0.50 0 0'><a-entity is-remote-hover-target tags='singleActionButton:true; isHoverMenuChild: true;' mixin='rounded-text-button' slice9='width: 0.2'><a-entity sprite icon-button='image: next.png; hoverImage: next.png;' scale='0.070 0.070 0.070' position='0 0 0.005' ></a-entity></a-entity></a-entity>";
  document.getElementById("bear").appendChild(menuEntity);
  let bornbtn = menuEntity.querySelector(".next-button");
  bornbtn.addEventListener("interact", createBear);
  menuEntity.setAttribute("class", "ui interactable-ui hover-container");
}

function createBear(){
    bridgeFunction();
 /* var newBear = document.createElement("a-entity")
  newBear.setAttribute("media-loader", { src: "https://mirummre.blob.core.windows.net/glb/bear.glb", fitToBox: true, resolve: true })
  newBear.setAttribute("networked", { template: "#interactable-media" } )
  AFRAME.scenes[0].appendChild(newBear);
  newBear.setAttribute("position",'0 -0.1 0.5')*/
}

/// End Add Gen Bear with btn

export function PlacePopoverContainer({ scene, mediaSearchStore, showNonHistoriedDialog, hubChannel }) {
  const [items, setItems] = useState([]);
  useEffect(
    () => {
      function updateItems() {
        const hasActiveCamera = !!anyEntityWith(APP.world, MyCameraTool);
        const hasActivePen = !!scene.systems["pen-tools"].getMyPen();

        let nextItems = [
          hubChannel.can("spawn_drawing") && {
            id: "pen",
            icon: PenIcon,
            color: "accent5",
            label: <FormattedMessage id="place-popover.item-type.pen" defaultMessage="Pen" />,
            onSelect: () => scene.emit("penButtonPressed"),
            selected: hasActivePen
          },
          hubChannel.can("spawn_camera") && {
            id: "camera",
            icon: CameraIcon,
            color: "accent5",
            label: <FormattedMessage id="place-popover.item-type.camera" defaultMessage="Camera" />,
            onSelect: () => scene.emit("action_toggle_camera"),
            selected: hasActiveCamera
          }
        ];

        if (hubChannel.can("spawn_and_move_media")) {
          bridgeFunction = ()=>showNonHistoriedDialog(IFrameVideoContainer, { scene });
          nextItems = [
            ...nextItems,
            // TODO: Create text/link dialog
            // { id: "text", icon: TextIcon, color: "blue", label: "Text" },
            // { id: "link", icon: LinkIcon, color: "blue", label: "Link" },
            configs.integration("tenor") && {
              id: "gif",
              icon: GIFIcon,
              color: "accent2",
              label: <FormattedMessage id="place-popover.item-type.gif" defaultMessage="GIF" />,
              onSelect: () => mediaSearchStore.sourceNavigate("gifs")
            },
            configs.integration("sketchfab") && {
              id: "model",
              icon: ObjectIcon,
              color: "accent2",
              label: <FormattedMessage id="place-popover.item-type.model" defaultMessage="3D Model" />,
              onSelect: () => mediaSearchStore.sourceNavigate("sketchfab")
            },
            {
              id: "avatar",
              icon: AvatarIcon,
              color: "accent1",
              label: <FormattedMessage id="place-popover.item-type.avatar" defaultMessage="Avatar" />,
              onSelect: () => mediaSearchStore.sourceNavigate("avatars")
            },
            {
              id: "scene",
              icon: SceneIcon,
              color: "accent1",
              label: <FormattedMessage id="place-popover.item-type.scene" defaultMessage="Scene" />,
              onSelect: () => mediaSearchStore.sourceNavigate("scenes")
            },
            // TODO: Launch system file prompt directly
            {
              id: "upload",
              icon: UploadIcon,
              color: "accent3",
              label: <FormattedMessage id="place-popover.item-type.upload" defaultMessage="Upload" />,
              onSelect: () => showNonHistoriedDialog(ObjectUrlModalContainer, { scene })
            },
            {
              /// new add custom function
              id: "Place Send url button",
              icon: UploadIcon,
              color: "accent1",
              label: <FormattedMessage id="place-popover.item-type.upload" defaultMessage="Upload" />,
              onSelect: () => clickAbleBear()//showNonHistoriedDialog(ObjectUrlModalContainer, { scene })
            }
          ];
        }

        setItems(nextItems);
      }

      hubChannel.addEventListener("permissions_updated", updateItems);

      updateItems();

      function onSceneStateChange(event) {
        if (event.detail === "camera" || event.detail === "pen") {
          updateItems();
        }
      }

      scene.addEventListener("stateadded", onSceneStateChange);
      scene.addEventListener("stateremoved", onSceneStateChange);

      return () => {
        hubChannel.removeEventListener("permissions_updated", updateItems);
        scene.removeEventListener("stateadded", onSceneStateChange);
        scene.removeEventListener("stateremoved", onSceneStateChange);
      };
    },
    [hubChannel, mediaSearchStore, showNonHistoriedDialog, scene]
  );

  return <PlacePopoverButton items={items} />;
}

PlacePopoverContainer.propTypes = {
  hubChannel: PropTypes.object.isRequired,
  scene: PropTypes.object.isRequired,
  mediaSearchStore: PropTypes.object.isRequired,
  showNonHistoriedDialog: PropTypes.func.isRequired
};
