import { get, ref, set } from "firebase/database";
import { database } from "../firebaseDatabaseConfig";
import { AudioType, Sex } from "./constants";

type BirdAudio = {
  [AudioType.CAll]: string[];
  [AudioType.SONG]: string[];
};

export const fetchAudioForOne = async (id: string) => {
  const dbRef = ref(database, `v2/birds/${id}/audio`);
  try {
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      console.log("Audio data found in Firebase for id:", id);
      return snapshot.val() as BirdAudio;
    }
  } catch (error) {
    console.error("Error reading from Firebase:", error);
  }

  const birdAudio: BirdAudio = {
    [AudioType.CAll]: [],
    [AudioType.SONG]: [],
  };

  try {
    const responseCall = await fetch(
      `https://search.macaulaylibrary.org/api/v1/search?taxonCode=${id}&tag=call&regionCode=na&mediaType=audio&sort=rating_rank_desc&limit=10`
    );
    if (!responseCall.ok) {
      throw new Error(`HTTP error! status: ${responseCall.status}`);
    }
    const dataCall = await responseCall.json();
    dataCall?.results?.content?.forEach((item: any) => {
      if (item.mediaUrl) {
        if (
          String(item?.behaviors).toLowerCase() === AudioType.CAll &&
          item?.source === "ebird" &&
          birdAudio[AudioType.CAll].length < 10
        ) {
          birdAudio[AudioType.CAll].push(item.mediaUrl);
        }
      }
    });

    const responseSong = await fetch(
      `https://search.macaulaylibrary.org/api/v1/search?taxonCode=${id}&tag=song&regionCode=na&mediaType=audio&sort=rating_rank_desc&limit=10`
    );
    if (!responseSong.ok) {
      throw new Error(`HTTP error! status: ${responseSong.status}`);
    }
    const dataSong = await responseSong.json();
    dataSong?.results?.content?.forEach((item: any) => {
      if (item.mediaUrl) {
        if (
          String(item?.behaviors).toLowerCase() === AudioType.SONG &&
          item?.source === "ebird" &&
          birdAudio[AudioType.SONG].length < 10
        ) {
          birdAudio[AudioType.SONG].push(item.mediaUrl);
        }
      }
    });

    // Save the result to Firebase RTDB for future use.
    try {
      await set(dbRef, birdAudio);
      console.log("Saved audio data to Firebase for id:", id);
    } catch (error) {
      console.error("Error saving to Firebase:", error);
    }

    return birdAudio;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const fetchAudioForMultiple = async (birdIds: string[]) => {
  const audioPromises = birdIds.map((id) => fetchAudioForOne(id));
  const audios = await Promise.all(audioPromises);
  return audios;
};

type BirdImage = {
  [Sex.MALE]: string[];
  [Sex.FEMALE]: string[];
};

export const fetchImageForOne = async (id: string) => {
  const dbRef = ref(database, `v2/birds/${id}/image`);
  try {
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      console.log("Image data found in Firebase for id:", id);
      return snapshot.val() as BirdImage;
    }
  } catch (error) {
    console.error("Error reading from Firebase:", error);
  }

  const birdImage: BirdImage = {
    [Sex.MALE]: [],
    [Sex.FEMALE]: [],
  };

  try {
    const responseMale = await fetch(
      `https://search.macaulaylibrary.org/api/v1/search?taxonCode=${id}&regionCode=na&sex=male&mediaType=photo&sort=rating_rank_desc&limit=10`
    );
    if (!responseMale.ok) {
      throw new Error(`HTTP error! status: ${responseMale.status}`);
    }
    const dataMale = await responseMale.json();
    dataMale?.results?.content?.forEach((item: any) => {
      if (item.previewUrl) {
        if (
          String(item?.sex).toLowerCase() === Sex.MALE &&
          birdImage[Sex.MALE].length < 10
        ) {
          birdImage[Sex.MALE].push(item.previewUrl);
        }
      }
    });
    const responseFemale = await fetch(
      `https://search.macaulaylibrary.org/api/v1/search?taxonCode=${id}&regionCode=na&sex=female&mediaType=photo&sort=rating_rank_desc&limit=10`
    );
    if (!responseFemale.ok) {
      throw new Error(`HTTP error! status: ${responseFemale.status}`);
    }
    const dataFemale = await responseFemale.json();
    dataFemale?.results?.content?.forEach((item: any) => {
      if (item.previewUrl) {
        if (
          String(item?.sex).toLowerCase() === Sex.FEMALE &&
          birdImage[Sex.FEMALE].length < 10
        ) {
          birdImage[Sex.FEMALE].push(item.previewUrl);
        }
      }
    });

    // Save the result to Firebase RTDB for future use.
    try {
      await set(dbRef, birdImage);
      console.log("Saved image data to Firebase for id:", id);
    } catch (error) {
      console.error("Error saving to Firebase:", error);
    }

    return birdImage;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const fetchImageForMultiple = async (birdIds: string[]) => {
  const imagePromises = birdIds.map((id) => fetchImageForOne(id));
  const images = await Promise.all(imagePromises);
  return images;
};
