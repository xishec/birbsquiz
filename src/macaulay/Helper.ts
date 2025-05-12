export enum AudioType {
  CAll = "call",
  SONG = "song",
}

type BirdAudio = {
  [AudioType.CAll]: string[];
  [AudioType.SONG]: string[];
};

export const fetchAudioForOne = async (id: string) => {
  const birdAudio: BirdAudio = {
    [AudioType.CAll]: [],
    [AudioType.SONG]: [],
  };

  try {
    const response = await fetch(
      `https://search.macaulaylibrary.org/api/v1/search?taxonCode=${id}&regionCode=na&mediaType=audio&sort=rating_rank_desc&limit=1`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data?.results?.content);
    data?.results?.content?.forEach((item: any) => {
      if (item.mediaUrl) {
        if (String(item?.behaviors).toLowerCase() === AudioType.CAll) {
          birdAudio[AudioType.CAll].push(item.mediaUrl);
        }
        if (String(item?.behaviors).toLowerCase() === AudioType.SONG) {
          birdAudio[AudioType.SONG].push(item.mediaUrl);
        }
      }
    });

    if (birdAudio[AudioType.CAll].length === 0) {
      data?.results?.content?.forEach((item: any) => {
        if (item.mediaUrl) {
          if (String(item?.behaviors).toLowerCase().includes(AudioType.CAll)) {
            birdAudio[AudioType.CAll].push(item.mediaUrl);
          }
        }
      });
    }

    if (birdAudio[AudioType.SONG].length === 0) {
      data?.results?.content?.forEach((item: any) => {
        if (item.mediaUrl) {
          if (String(item?.behaviors).toLowerCase().includes(AudioType.SONG)) {
            birdAudio[AudioType.SONG].push(item.mediaUrl);
          }
        }
      });
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

export enum Sex {
  MALE = "male",
  FEMALE = "female",
}

type BirdImage = {
  [Sex.MALE]: string[];
  [Sex.FEMALE]: string[];
};

export const fetchImageForOne = async (id: string) => {
  const birdImage: BirdImage = {
    [Sex.MALE]: [],
    [Sex.FEMALE]: [],
  };

  try {
    const response = await fetch(
      `https://search.macaulaylibrary.org/api/v1/search?taxonCode=${id}&regionCode=na&mediaType=photo&sort=rating_rank_desc&limit=1`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    data?.results?.content?.forEach((item: any) => {
      if (item.previewUrl) {
        if (String(item?.sex).toLowerCase() === Sex.MALE) {
          birdImage[Sex.MALE].push(item.previewUrl);
        }
        if (String(item?.sex).toLowerCase() === Sex.FEMALE) {
          birdImage[Sex.FEMALE].push(item.previewUrl);
        }
      }
    });

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
