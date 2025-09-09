import { StyleSheet, View, Image, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean>(false);

  const [image, setImage] = useState<string | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [flash, setFlash] = useState<"off" | "on">("off");

  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus.status === "granted");
    };
    requestPermission();
  }, []);

  if (!cameraPermission) {
    return null;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={48} color="gray" />
        <TouchableOpacity style={styles.permissionBtn} onPress={requestCameraPermission}>
          <Ionicons name="lock-open" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  const handleSaveToGallery = async () => {
    if (image) {
      try {
        await MediaLibrary.createAssetAsync(image);
        Alert.alert("✅ Saved", "Image saved to gallery!");
        setImage(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
        setImage(photo.uri);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // --- เมื่อถ่ายรูปแล้ว ---
  if (image) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: image }} style={{ flex: 1, width: "100%" }} />
        <View style={styles.previewControls}>
          <TouchableOpacity style={styles.circleBtn} onPress={() => setImage(null)}>
            <Ionicons name="refresh" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleBtn} onPress={handleSaveToGallery}>
            <Ionicons name="save" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- หน้ากล้อง ---
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={{ flex: 1, width: "100%" }} facing={facing} flash={flash} />

      {/* ปุ่มด้านบน */}
      <View style={styles.topControls}>
        <TouchableOpacity onPress={() => setFlash(flash === "off" ? "on" : "off")}>
          <Ionicons name={flash === "off" ? "flash-off" : "flash"} size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setFacing(facing === "back" ? "front" : "back")}>
          <Ionicons name="camera-reverse" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* ปุ่มถ่ายรูป */}
      <View style={styles.bottomControls}>
        <TouchableOpacity onPress={handleTakePicture} style={styles.captureBtn}>
          <View style={styles.innerCircle} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionBtn: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 50,
  },
  topControls: {
    position: "absolute",
    top: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 30,
  },
  bottomControls: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  previewControls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  circleBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});
