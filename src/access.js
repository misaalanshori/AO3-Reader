import localforage from "localforage";

let apiurl = "http://ao3webapi.herokuapp.com/";
// let apiurl = "http://localhost:3000/";

// Localforage instances and format
var worksList = localforage.createInstance({
  // Key: ID: {timeadded: UNIXTIMESTAMP, timeadded: UNIXTIMESTAMP, timeupdated:UNIXTIMESTAMP, filetypes: [array of downloaded filetypes]}
  name: "workList",
});

var works = localforage.createInstance({
  // Key: ID: {/works/:id}
  name: "works",
});

var worksblob = localforage.createInstance({
  // Key: ID_filetype: {blob: /works/:id/download/:type, timeadded: UNIXTIMESTAMP}
  name: "worksBlob",
});

var feedsList = localforage.createInstance({
  // Key: FEEDID: {name: USERINPUT, path: AO3PATH, pagecount: PAGECOUNT, timeadded: UNIXTIMESTAMP, timeupdated: UNIXTIMESTAMP}
  name: "feedsList",
});

var feeds = localforage.createInstance({
  // Key: FEEDID_page: {works: {/feed/:path/:page}[works], timeadded: UNIXTIMESTAMP}
  name: "feeds",
});

var bookmarksList = localforage.createInstance({
  // Key: ID: {dateadded: UNIXTIMESTAMP}
  name: "bookmarkList",
});

export function getWork(id) {
  return new Promise((resolve, reject) => {
    // I'm 100% sure there is a better way to do this. But I really don't want to figure that out right now. So ugly code it is. Hello Future me, please fix this
    works
      .getItem(id) // Get work from local storage
      .then((item) => {
        if (item) {
          resolve(item); // Resolve with item if available
        } else {
          fetch(`${apiurl}works/${id}`) // Fetch work if unavailable
            .then((resp) => {
              resp.json().then((d) => {
                works
                  .setItem(id, d) // Store in local storage
                  .then((v) => {
                    worksList
                      .setItem(id, { dateAdded: Date.now() })
                      .catch((err) => reject(err));
                    resolve(v);
                  })
                  .catch((err) => reject(err));
              });
            })
            .catch((err) => reject(err));
        }
      })
      .catch((err) => reject(err));
  });
}

export function getWorkBlob(id, type) {
  return new Promise((resolve, reject) => {
    worksblob
      .getItem(`${id}_${type}`)
      .then((item) => {
        if (item) {
          resolve(item);
        } else {
          fetch(`${apiurl}works/${id}/document/${type}`)
            .then((resp) => {
              resp.blob().then((d) => {
                worksblob
                  .setItem(`${id}_${type}`, { blob: d, timeadded: Date.now() })
                  .then((v) => {
                    worksList.getItem(id).then(info => {
                        info["filetypes"] = info["filetypes"].concat(type.toLowerCase())
                        worksList.setItem(id, info).catch((err) => reject(err))
                    }).catch((err) => reject(err))
                    resolve(v)
                })
                  .catch((err) => reject(err));
              });
            })
            .catch((err) => reject(err));
        }
      })
      .catch((err) => reject(err));
  });
}

export function listWorks() {
  return worksList.keys();
}

export function workInfo(id) {
  return worksList.getItem(id);
}

export function deleteWork(id) {
  return new Promise((resolve, reject) => {
    worksList.getItem(id).then((v) => {
        Promise.all([
            ...v["filetypes"].map((v) => worksblob.removeItem(`${id}_${v}`)),
            worksList.removeItem(id).catch((err) => reject(err)),
            works.removeItem(id).catch((err) => reject(err)),
          ])
            .then(() => resolve(id))
            .catch((err) => reject(err));
    })
  });
}

export function addfeed(name, path) {
  return new Promise((resolve, reject) => {
    fetch(`${apiurl}feed/${encodeURIComponent(path)}/1`)
      .then((resp) => {
        resp.json().then((json) => {
          let feedid = "uid_" + Math.floor(Math.random() * Date.now());
          let timenow = Date.now();
          Promise.all([
            feedsList.setItem(feedid, {
              name: name,
              path: path,
              totalpage: json["pages"],
              timeadded: timenow,
              timeupdated: timenow,
            }),
            feeds.setItem(`${feedid}_1`, { json: json, timeupdated: timenow }),
          ])
            .then(() => resolve(feedid))
            .catch((err) => reject(err));
        });
      })
      .catch((err) => reject(err));
  });

  // returns feedid
}


export function getfeed(feedid, page, force=false) {
  return new Promise((resolve, reject) => {
    feedsList
      .getItem(feedid)
      .then((info) => {
        if (info) {
          feeds.getItem(`${feedid}_${page}`).then((item) => {
            if (item) {
              if (item["timeupdated"] < info["timeupdated"] || force) {
                fetch(`${apiurl}feed/${encodeURIComponent(info["path"])}/${page}`)
                .then((resp) =>
                resp.json().then((json) => {
                    feeds
                    .setItem(`${feedid}_${page}`, {
                        json: json,
                        timeupdated: Date.now(),
                    })
                    .then((item) => {
                        resolve(item);
                    })
                    .catch((err) => reject(err));
                })
                );
              } else {
                resolve(item);
              }
            } else {
              fetch(`${apiurl}feed/${encodeURIComponent(info["path"])}/${page}`)
              .then((resp) =>
                resp.json().then((json) => {
                  feeds
                    .setItem(`${feedid}_${page}`, {
                      json: json,
                      timeupdated: Date.now(),
                    })
                    .then((item) => {
                      resolve(item);
                    })
                    .catch((err) => reject(err));
                })
              );
            }
          });
        } else {
          reject("invalid feedid");
        }
      })
      .catch((err) => reject(err));
  });

  // returns /feed/:path/:page
}

export function removefeed(feedid) {
  return new Promise((resolve, reject) => {
    feeds.keys().then(keys => {
        Promise.all([
            ...keys.filter(v => v.startsWith(feedid)).map(v => feeds.removeItem(v)),
            feedsList.removeItem(feedid),
        ]).then(resolve(feedid)).catch((err) => reject(err))
    })

  })
}

export function updatefeed(feedid) {
  return new Promise((resolve, reject) => {
    feedsList.getItem(feedid).then((info) => {
      if (info) {
        getfeed(feedid, 1, true)
          .then((item) => {
            info["dateupdated"] = Date.now();
            info["totalpage"] = item["json"]["pages"];
            feedsList
              .setItem(feedid, info)
              .then(() => resolve(feedid))
              .catch((err) => reject(err));
          })
          .catch((err) => reject(err));
      } else {
        reject("invalid feedid");
      }
    });
  });
}

export function listfeed() {
  return new Promise((resolve, reject) => {
    let list = [];
    feedsList
      .iterate((v, k) => {console.log(v,k); list.push({ label: v["name"], id: k })})
      .then(() => resolve(list))
      .catch((err) => reject(err));
  });
}

export function getFeedOld(path, page) {
  return new Promise((resolve, reject) =>
    fetch(`${apiurl}feed/${encodeURIComponent(path)}/${page}`)
      .then((r) =>
        r
          .json()
          .then((v) => resolve(v))
          .catch((err) => reject(err))
      )
      .catch((err) => reject(err))
  );
}

