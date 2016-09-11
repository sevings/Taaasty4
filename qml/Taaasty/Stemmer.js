// https://github.com/titarenko/ukrstemmer
// ported from https://www.drupal.org/project/ukstemmer

.pragma library

var RVRE = /^(.*?[уеыаоэяию])(.*)$/;

var REFLEXIVE = /(с[яьи])$/;
var SUFFIX = /([иы]?в(?:ши)?|[иыое][йме]|[ео]го|[ео]му|[ая]я|[еоую]?ю|[иы]х|[иы]ми|[ие]шь|[ие]т|[ие]м|[ие]те|[уюя]т|л[аои]?|[тч][ьи]|вши?|[ео]в|[ая]ми|еи|и|а|я|е|й|о|у|и?[ея]м|[ао]м|ах|и?ях|ы|ию|ь[юя]?|ия|ени|енем|от)$/

//var DERIVATIONAL = /[^уеыаоэяию][уеыаоэяию]+[^уеыаоэяию]+[уеыаоэяию].*$/;
var DERIVATIONAL = /(е?[мн]?ост|лк|(?:ль)?[нчщ]?ик|и?к|льн|ь|енн|тор|тель|овец|ист|ец|ач|[аея]нт|[ая]не?ц|ч?[ая]н(?:ин)?|е?н[иь]|[ая]ци|фикаци|е?ств|изм|ур|аж|ч?ик|очк|[еи]?ц|[уыю]шк|[ео]нь?к|ищ|ующ)$/;

var PERFECTIVEPREFIX = /^(наи)/;
var PERFECTIVESUFFIX = /([ае]йш)$/;

function stem(word) {
    if (!word || !word.length)
		return word;

	word = word.toLowerCase();
    word = word.replace('ё', 'е');

	var stem = word;
    if (!word.match(RVRE))
        return stem;

    // Step 1
    stem = stem.replace(REFLEXIVE, '');
    var test = stem.replace(SUFFIX, '');
    if (RVRE.test(test))
        stem = test;
    else
        return stem;

    // Step 2
    test = stem.replace(/и$/, '');
    if (RVRE.test(test))
        stem = test;
    else
        return stem;

    // Step 3

    test = stem.replace(DERIVATIONAL, '');
    if (RVRE.test(test))
        stem = test;
    else
        return stem;

    // Step 4
    var m = stem.replace(/ь$/, '');
    if (m === stem) {
        stem = stem.replace(PERFECTIVEPREFIX, '');
        stem = stem.replace(PERFECTIVESUFFIX, '');
        stem = stem.replace(/нн$/, 'н');
    } else {
        stem = m;
    }

	return stem;
}
