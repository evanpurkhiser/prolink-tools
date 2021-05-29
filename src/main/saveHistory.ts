import {createObjectCsvWriter} from 'csv-writer';
import {formatISO} from 'date-fns';
import {app} from 'electron';
import {autorun, reaction, runInAction, when} from 'mobx';

import {mkdir, writeFile} from 'fs/promises';
import path from 'path';

import {AppStore} from 'src/shared/store';
import trackFormat from 'src/utils/trackFormat';
import trackToObject from 'src/utils/trackToObject';

/**
 * Configures the live history autorun handlers
 */
export const setupSaveHistory = (store: AppStore) => {
  const {saveHistory} = store.config;

  // Use the dcouments folder if this hasn't already been configured
  if (saveHistory.fileDirectory === '') {
    runInAction(() => (saveHistory.fileDirectory = app.getPath('documents')));
  }

  const startStoringLiveHistory = () =>
    autorun(async () => {
      const {fileDirectory, fileName, formats, fullHistory, txtFormat} = saveHistory;
      const {tracks} = store.mixstatus.liveSet;

      console.log('doing it!');

      await mkdir(fileDirectory, {recursive: true});

      // When not in full history mode we keep only the most recent track entry
      const sliceAt = fullHistory ? 0 : -1;

      const getTrackObjects = () =>
        tracks.slice(sliceAt).map(played => ({
          trackNum: tracks.indexOf(played)! + 1,
          playedAt: formatISO(played.playedAt),
          ...trackToObject(played.track),
        }));

      if (formats.includes('txt')) {
        const data = tracks
          .slice(sliceAt)
          .map(p => trackFormat(p.track, txtFormat))
          .join('\n');
        writeFile(path.join(fileDirectory, `${fileName}.txt`), data);
      }

      if (formats.includes('json')) {
        const data = JSON.stringify(getTrackObjects(), null, 4);
        writeFile(path.join(fileDirectory, `${fileName}.json`), data);
      }

      if (formats.includes('csv')) {
        const data = getTrackObjects();
        const writer = createObjectCsvWriter({
          path: path.join(fileDirectory, `${fileName}.csv`),
          header: Object.keys(data[0] ?? {}).map(k => ({id: k, title: k})),
        });
        writer.writeRecords(data);
      }
    });

  reaction(
    () => store.config.saveHistory.enabled,
    enabled => {
      if (enabled) {
        const disable = startStoringLiveHistory();
        when(() => store.config.saveHistory.enabled === false, disable);
      }
    },
    {fireImmediately: true}
  );
};
