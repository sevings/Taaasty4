//.pragma library

var includeFavorites = true;



function AATree(val, update) {
/*
                                  AATree
                                MIT License
        Copyright © 2014 Andrew Lowndes (http://www.andrewlowndes.co.uk)
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
    if (val===undefined) val = null;

    this.val = val;
    this.update = update;
    this.level = 1;
    this.left = null;
    this.right = null;
 }

 AATree.swap = function(obj, name, obj2, name2) {
    var temp = obj[name];
    obj[name] = obj2[name2];
    obj2[name2] = temp;
 };

 AATree.prototype = {
    isLeaf: function() {
        return (this.left === null && this.right === null);
    },
    leftmost: function() {
        var L = this;

        do {
            if (L.left === null) {
                return L;

            }
        } while ((L = L.left));
    },
    successor: function() {
        if (this.right!= null) {
            return this.right.leftmost().val;
        } else {
             return null;
        }
    },
    rightmost: function() {
        var R = this;

        do {
            if (R.right === null) {
                return R;
            }
        } while ((R = R.right));
    },
    predecessor: function() {
        if (this.left != null) {
            return this.left.rightmost().val;
        } else {
            return null;
        }
    },
    skew: function() {
        if (this.left != null && this.left.level == this.level) {
            AATree.swap(this, 'val', this.left, 'val');
            AATree.swap(this, 'update', this.left, 'update');

            AATree.swap(this.left, 'right', this, 'right');
            AATree.swap(this.left, 'left', this, 'right');
            AATree.swap(this, 'left', this, 'right');
        }
    },
    split: function() {
        if (this.right != null && this.right.right != null && this.level == this.right.right.level) {
            AATree.swap(this, 'val', this.right, 'val');
            AATree.swap(this, 'update', this.right, 'update');
            AATree.swap(this, 'level', this.right, 'level');

            AATree.swap(this, 'left', this.right, 'right');
            AATree.swap(this.right, 'left', this.right, 'right');
            AATree.swap(this, 'left', this, 'right');

            this.level++;
        }
    },
    decreaseLevel: function() {
        var requiredLevel = 1;

        if (this.left != null) {
            requiredLevel = this.left.level + 1;
        }

        if (this.right != null) {
            requiredLevel = Math.min(requiredLevel, this.right.level + 1);
        }

        if (requiredLevel < this.level) {
            this.level = requiredLevel;
            if (this.right != null && requiredLevel < this.right.level) {
                this.right.level = requiredLevel;
            }
        }
    },

    insert: function(val, loading) {
        if (this.val === null) {
            this.val = val;
            this.update = !loading;
            return;
        }

        if (val < this.val) {
            if (this.left === null) {
                this.left = new AATree(val, !loading);
            } else {
                if (this.left.insert(val, loading) === false) {
                    return false;
                }
            }
        } else if (val > this.val) {
            if (this.right === null) {
                this.right = new AATree(val, !loading);
            } else {
                if (this.right.insert(val, loading) === false) {
                    return false;
                }
            }
        } else {
            return false;
        }

        this.skew();
        this.split();
    },

    remove: function(val) {
        if (val<this.val) {
            if (this.left===null) return;
            if (this.left.remove(val) === false) {
                this.left = null;
                return;
            }
        } else if (val>this.val) {
            if (this.right===null) return;
            if (this.right.remove(val) === false) {
                this.right = null;
                return;
            }
        } else {
            // If we're a leaf, easy, otherwise reduce to leaf case.
            if (this.isLeaf()) {
                this.val = null;
                return false;
            } else if (this.left === null) {
                // Get successor value and delete it from right tree,
                // and set root to have that value
                var Succ = this.successor();
                if (this.right.remove(Succ)===false) {
                    this.right = null;
                }

                this.val = Succ;
            } else {
                // Get predecessor value and delete it from left tree,
                // and set root to have that value
                var Pred = this.predecessor();
                if (this.left.remove(Pred)===false) {
                    this.left = null;
                }

                this.val = Pred;
            }
        }

        this.decreaseLevel();
        this.skew();

        if (this.right) {
            this.right.skew();
            if (this.right.right) this.right.right.skew();
        }

        this.split();
        if (this.right) this.right.split();
    },
    contains: function(val) {
        var P = this;

        while (P != null) {
            if (val < P.val) {
                P = P.left;
            } else if (val > P.val) {
                P = P.right;
            } else {
                return true;
            }
        }

        return false;
    },
    first: function() {
        return this.leftmost().val;
    },
    last: function() {
        return this.rightmost().val;
    },
    isEmpty: function() {
        return this.val === null;
    },
    count: function() {
        if (this.val === null) {
            return 0;
        } else {
            var count = 1;
            if (this.left) count+= this.left.count();
            if (this.right) count+= this.right.count();
            return count;
        }
    },
    overlapping: function(val) {
        if (this.val === null) {
            return null;
         } else {
            if (val < this.val) {
                return this.left.overlapping(val);
            } else if (val > this.val) {
                return this.right.overlapping(val);
            } else {
                return this.val;
            }
        }
    },
    print: function(indent) {
        indent = indent || 1;

        var str = "";

        if (this.right) str += this.right.print(indent+1);
        str += "\n" + (new Array(indent).join(" ")) + this.val;
        if (this.left) str += this.left.print(indent+1);

        return str;
    },
    store: function(tx) {
           if (this.update) {
               tx.executeSql('INSERT OR REPLACE INTO bayes_entries VALUES (?)', [this.val]);
               this.update = false;
           }
           if (this.right) this.right.store(tx);
           if (this.left) this.left.store(tx);
       }
 };

function types() {
    return {
        water: [],
        fire: []
    }
}

var bayes = types(); //word counts
var bayesChanged = types(); // true if word count changed
var bayesTlogs = types(); //list of tlogs
var bayesEntries = new AATree(); //ratings + if is had updated
var bayesTotal = { //total sum of words
    water: 0,
    fire: 0
}


function addFeature(feature, features, type) {
    if (!features[feature]) {
        features[feature] = 1;
    }
    else
        features[feature]++;

    if (type)
        bayesChanged[type][feature] = true;
}

function addText(text, features, type) {
    if (!text)
        return 0;

    text = text
        .replace(/<\s*(?:a|img)[^>]+(?:href|src)\s*=\s*['"]([^\s'"]+)['"][^>]*>/gi, ' $1 ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&\w+;/g, ' ')
        .replace(/https?:\/\/([\w\-\.]+)\.\w+\/[^\s]*\.(\w+)\s/g, ' $1 $2 ')
        .replace(/https?:\/\/([\w\-\.]+)\.\w+\/?[^\s]*\s/g, ' $1 ')

    var length = 0;
    if (/[\.!?]/g.test(text)) {
        length = 2;
        if (/^\s*[A-ZА-ЯЁ]/gm.test(text) || /[\.!?]\s*[A-ZА-ЯЁ]/g.test(text))
            addFeature('.normal_case', features, type);
        else
            addFeature('.lower_case', features, type);

        if (/[A-ZА-ЯЁa-zа-яё][\.,!?]\s+[A-ZА-ЯЁa-zа-яё]/g.test(text))
            addFeature('.correct_spaces', features, type);
        else
            addFeature('.wrong_spaces', features, type);
    }

    var words = text.split(/[^a-zA-Zа-яА-ЯёЁ]+/);
    words.forEach(function(word, i, words) {
        if (word.length > 0) {
            word = Stemmer.stem(word);
            addFeature(word, features, type);
            length++;
        }
    });

    return length;
}

function calcEntry(entry, features, type, minLength) {
    var content = addText(entry.text, features, type);
    var title = addText(entry.title, features, type);

//    console.log(title, content);
    if (minLength && content < minLength && title < minLength)
        return -1;

    if (content > 100 || title > 100)
        addFeature('.long', features, type)
    else
        addFeature('.short', features, type)

    addFeature('.type_' + entry.type, features, type);
    addFeature('.author_' + entry.author.slug, features, type);

//    if (entry.is_voteable)
//        addFeature('.votable', features);
//    else
//        addFeature('.not_votable', features);

    if (entry.author.is_female)
        addFeature('.female', features, type);
    else
        addFeature('.male', features, type);

    if (entry.author.is_daylog)
        addFeature('.daylog', features, type);
    else
        addFeature('.wholelog', features, type);

    if (entry.tlog.author.is_flow)
        addFeature('.flow', features, type);
    else
        addFeature('.tlog', features, type);

    if (entry.author.is_premium)
        addFeature('.premium', features, type);
    else
        addFeature('.free', features, type);

    return content + title + 7;
}

function isEntryAdded(id) {
    return bayesEntries.contains(id);
}

function isTlogAdded(id, included) {
    for (var type in bayesTlogs) {
        for (var i in bayesTlogs[type])
            if (bayesTlogs[type][i].id == id && !bayesTlogs[type][i].removed
                    && ((included && !bayesTlogs[type][i.bayes_include]) || !included))
                return { type: type, index: i };
    }
    return false;
}

function addEntry(entry, type) {
    if (isEntryAdded(entry.id))
        return 0;

    bayesEntries.insert(entry.id);
    return calcEntry(entry, bayes[type], type);
}

function classify(entry, minLength) {
    if (!bayesTotal.fire || !bayesTotal.water)
        return 0;

    var type;
    var values = [];
    var features = [];
    var length = calcEntry(entry, features, false, minLength);
    if (length < 0)
        return length;

    for (type in bayes) {
        var k = (bayesTotal.fire + bayesTotal.water) / bayesTotal[type] ;
//        console.log(bayesTotal.fire, bayesTotal.water, k);
        values[type] = 0;//Math.log(bayesTotal[type]);
//        console.log(type + ': ' + values[type]);
        for (var feature in features) {
            var cnt = bayes[type][feature];
            if (!cnt)
                continue;
            values[type] += Math.log(cnt * k);
//            if (feature[0] == '.')
//                console.log(feature, type, Math.round(Math.log(cnt * k)));
        }
//        console.log(type + ': ' + values[type]);
    }

    var resValue = (values.fire - values.water) / length * 50;
    return Math.round(resValue);
}



var loaded = false;
var db;

function initDatabase() {
    //console.log("initDatabase()");
    db = openDatabaseSync("taaasty", "1", "Bayes", 2000000);
    db.transaction( function(tx) {
        //console.log("... create tables");
//        tx.executeSql("DROP TABLE bayes");
//        tx.executeSql("DROP TABLE bayes_tlogs");
//        tx.executeSql("DROP TABLE bayes_entries");
        tx.executeSql("CREATE TABLE IF NOT EXISTS bayes         (type TEXT, word TEXT, total INTEGER, PRIMARY KEY(type, word))");
//        tx.executeSql("CREATE TABLE IF NOT EXISTS bayes_total   (type TEXT, total INTEGER, PRIMARY KEY(type))");
        tx.executeSql("CREATE TABLE IF NOT EXISTS bayes_tlogs   (type TEXT, n INTEGER, tlog INTEGER, latest INTEGER, PRIMARY KEY(tlog))");
        tx.executeSql("CREATE TABLE IF NOT EXISTS bayes_entries (entry INTEGER, PRIMARY KEY(entry))");
    });
}

function load() {
    if (loaded)
        return;
    console.log('loading bayes...');
    var now = Date.now();
    initDatabase();
    db.transaction( function(tx) {
       var i;
       var result = tx.executeSql('SELECT * FROM bayes').rows;
       for (i = 0; i < result.length; i++)
           bayes[result.item(i).type][result.item(i).word] = Number(result.item(i).total);

//       result = tx.executeSql('SELECT * FROM bayes_total').rows;
//       result = tx.executeSql('SELECT type, SUM(total) AS "total" FROM bayes WHERE word LIKE ".type%" GROUP BY type').rows;
//       for (i = 0; i < result.length; i++)
//           bayesEntriesTotal[result.item(i).type] = result.item(i).total;

       result = tx.executeSql('SELECT type, sum(total) AS "total" FROM bayes GROUP BY type').rows;
       for (i = 0; i < result.length; i++)
           bayesTotal[result.item(i).type] = Number(result.item(i).total);

       result = tx.executeSql('SELECT * FROM bayes_tlogs WHERE tlog > 0 ORDER BY n').rows;
       for (i = 0; i < result.length; i++)
           bayesTlogs[result.item(i).type].push({ id: Number(result.item(i).tlog), bayes_include: true, bayes_latest: Number(result.item(i).latest) });

       result = tx.executeSql('SELECT latest FROM bayes_tlogs WHERE tlog = -1').rows;
       if (result.length > 0)
           lastFavorite = Number(result.item(0).latest);

       result = tx.executeSql('SELECT * FROM bayes_entries').rows;
       for (i = 0; i < result.length; i++)
           bayesEntries.insert(Number(result.item(i).entry), true);

       loaded = true;
       console.log('done in', Date.now() - now, 'ms');
    });
}

function store() {
    if (!loaded)
        return;
    console.log('storing bayes...');
    var now = Date.now();
    db.transaction( function(tx) {
        for (var type in bayes) {
//            tx.executeSql('INSERT OR REPLACE INTO bayes_total VALUES (?, ?)', [type, bayesEntriesTotal[type]]);

            for (var word in bayesChanged[type])
                tx.executeSql('INSERT OR REPLACE INTO bayes VALUES (?, ?, ?)', [type, word, bayes[type][word]]);
            bayesChanged[type] = [];

            for (var tlog = 0; tlog < bayesTlogs[type].length; tlog++)
                if (bayesTlogs[type][tlog].bayes_include && !bayesTlogs[type][tlog].removed)
                    tx.executeSql('INSERT OR REPLACE INTO bayes_tlogs VALUES (?, ?, ?, ?)',
                                  [type, tlog, bayesTlogs[type][tlog].id, bayesTlogs[type][tlog].bayes_latest]);

            tx.executeSql('INSERT OR REPLACE INTO bayes_tlogs VALUES (?, ?, ?, ?)', ['fire', -1, -1, lastFavorite]);
        }
        bayesEntries.store(tx);
        console.log('done in', Date.now() - now, 'ms');
    });
}



var curType = 'water';
var iCurTlog = 0;
var curTlog = '';
var entriesLoaded = 0;
var entriesLoadedTotal = 0;
var entriesTotal = 0;

var lastFavorite = 0;

function startTrain(full) {
    API.onError = nextTlog;
    window.secondMode = 'bayesLoad';
    bayesLoad.fullLoad = full;
    Ctrl.fillHeader();
    tlogBar.text = '';
    tlogBar.value = 0;
    tlogBar.max = 0;
    allBar.value = 0;
    allBar.max = 0;
    startDownload();
}

function finishTrain() {
    finishDownload();
    Ctrl.init();
    store();
}

function nextTlog() {
    iCurTlog++;
    entriesLoaded = 0;
    curTlog = bayesTlogs[curType][iCurTlog];
    console.log('train ' + iCurTlog + '/' + bayesTlogs[curType].length + ' ' + curType);

    if (!curTlog || !curTlog.slug) {
        if (curType === 'water' && bayesTlogs['fire'].length > 0 && bayesLoad.fullLoad) {
            curType = 'fire';
            iCurTlog = -1;
            if (includeFavorites)
                trainTlog(false, true, lastFavorite);
            else
                nextTlog();
        }
        else {
            finishTrain();
        }
    }
    else if (curTlog.bayes_include)
        trainTlog(false, false, curTlog.bayes_latest);
    else
        nextTlog();
}

function trainTlog(before, favorites, latest) {
    if (window.secondMode != 'bayesLoad')
        return finishTrain();

    tlogBar.text = (favorites ? 'Избранное' : curTlog.name);
    tlogBar.value = entriesLoaded;
    tlogBar.max = (favorites ? entriesLoaded : curTlog.public_entries_count);
    allBar.value = entriesLoadedTotal;
    allBar.max = entriesTotal;

    function process(tlog) {
        if (tlog === undefined || tlog.length === 0) {
            console.log('loading done')
            nextTlog();
            return;
        }

        if (!before)
            if (favorites && tlog[tlog.length-1].id > lastFavorite)
                lastFavorite = tlog[0].id;
            else if (!favorites && tlog[tlog.length-1].id > curTlog.bayes_latest)
                curTlog.bayes_latest = tlog[0].id;

        entriesLoaded += tlog.length;
        if (!favorites && entriesLoaded <= curTlog.public_entries_count)
            entriesLoadedTotal += tlog.length;

        for (var e in tlog)
            bayesTotal[curType] += addEntry(tlog[e], curType);

        console.log('latest:', latest, 'current:', tlog[tlog.length-1].id);
        if (tlog[tlog.length-1].id <= latest) {
            if (!favorites && entriesLoaded < curTlog.public_entries_count)
                entriesLoadedTotal += curTlog.public_entries_count - entriesLoaded;
            nextTlog();
        }
        else
            trainTlog(true, favorites, latest);
    }

    if (favorites)
        API.getFavorites(process, before);
    else
        API.getTlog(process, curTlog.id, before);
}

function startDownload() {
    notsTimer.stop();
    conversTimer.stop();
    // dialog timer?

    window.busy++;
}

function finishDownload() {
    window.busy--;

    notsTimer.start();
    conversTimer.start();

    if (window.secondMode === 'bayesLoad')
        Ctrl.closeSecondWindow();
}

function showUsers(type, api, contin) {
    if (!contin) {
        if (bayesTlogs[type].length > 0)
            if (bayesTlogs[type][0].slug !== undefined)
                return Ctrl.showBayesUsers(bayesTlogs[type], false, type);
            else
                return loadTlogs(type);
        startDownload();
        if (type === 'fire') {
            addMe();
            return;
        }
    }

    api(function(tlogs) {
        if (tlogs === undefined || tlogs.length === 0) {
            Ctrl.showBayesUsers(bayesTlogs[type], false, type);
            finishDownload();
            return;
        }
        for (var i in tlogs) {
            tlogs[i]['bayes_include'] = true;
            if (!tlogs[i].bayes_latest)
                tlogs[i]['bayes_latest'] = 0;
            bayesTlogs[type].push(tlogs[i]);
        }
        showUsers(type, api, true);
    }, true);
}

function showFire() {
    showUsers('fire', API.getMyFollowings);
}

function showWater() {
    showUsers('water', API.getMyIgnored);
}

function addMe() {
//    console.log('adding me');
    API.getMe(function(me) {
        me['bayes_include'] = true;
        if (!me.bayes_latest)
            me['bayes_latest'] = 0;
        bayesTlogs['fire'].push(me);
        showUsers('fire', API.getMyFollowings, true);
    }, true);
}

function train() {
    startTrain(true);
    entriesLoaded = 0;
    entriesTotal = 0;
    entriesLoadedTotal = 0;

    for (var type in bayesTlogs) {
        bayesTlogs[type].forEach(function (tlog) {
            if (tlog.bayes_include) {
                entriesTotal += tlog.public_entries_count;
            }
        });
    }

    iCurTlog = 0;
    curType = 'water';
    curTlog = bayesTlogs[curType][iCurTlog];
    if (!curTlog || !curTlog.slug)
        return nextTlog();

    trainTlog(false, false, curTlog.bayes_latest);
}

function toggleInclude(type, id) {
    //console.log('type: ' + type + ', slug: ' + slug);
    for (var i = 0; i < bayesTlogs[type].length; i++) {
        if (bayesTlogs[type][i].id != id || bayesTlogs[type][i].removed)
            continue;

        var tlog = bayesTlogs[type][i];
        var include = !tlog['bayes_include'];
        usersModel.get(i).bayes_include = include;
        tlog['bayes_include'] = include;
        break;
    }
}

function addTlog(type, id, next) {
//    console.log('adding tlog with type: ' + type + ', slug: ' + slug);
    window.busy++;
    API.getTlogInfo(function(tlog) {
                window.busy--;
                tlog = tlog.author;
                tlog['bayes_include'] = true;
                var existing = isTlogAdded(tlog.id);
                if (existing) {
                    if (existing.type !== type && !bayesTlogs[existing.type][existing.index].bayes_include) {
                        bayesTlogs[existing.type][existing.index]['removed'] = true;
                        tlog['bayes_latest'] = 0;
                        bayesTlogs[type].push(tlog);
                    }
                    else if (!next)
                        return dialog.show(id + ' уже в списках');
                    else {
                        var latest = bayesTlogs[type][iCurTlog].bayes_latest;
                        bayesTlogs[type][iCurTlog] = tlog;
                        bayesTlogs[type][iCurTlog]['bayes_latest'] = latest;
                    }
                }
                else {
                    tlog['bayes_latest'] = 0;
                    bayesTlogs[type].push(tlog);
                }
                Ctrl.showBayesUsers([tlog], true, type);
                if (next)
                    next(type, tlog.id);
            }, id);
}

function loadTlogs(type, id) {
//    console.log('loading tlog with type: ' + type + ', id: ' + id);
    if (!id) {
        startDownload();
        Ctrl.showBayesUsers([], false, type);
        iCurTlog = 0;
    }
    else
        iCurTlog++;

    if (!bayesTlogs[type][iCurTlog])
        return finishDownload();

    id = bayesTlogs[type][iCurTlog].id;
    addTlog(type, id, loadTlogs);
}

function voteForEntry(entry, against) {
    var type = against ? 'water' : 'fire';
    bayesTotal[type] += addEntry(entry, type);
    return classify(entry);
}

function voteForTlog(tlog, against) {
    startTrain(false);
    curType = against ? 'water' : 'fire';
    iCurTlog = bayesTlogs[curType].length - 1;
    addTlog(curType, tlog, nextTlog);
}
