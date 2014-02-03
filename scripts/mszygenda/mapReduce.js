function map () {
  var getTimeOfDay = function (record) {
    var date = new Date(record.Date);
    var hour = date.getHours();

    if (hour >= 0 && hour <= 5) {
      return "Night";
    } else if (hour >= 6 && hour <= 12) {
      return "Morning";
    } else if (hour >= 13 && hour <= 18) {
      return "Afternoon";
    } else {
      return "Evening";
    }
  }

  var getLightsInfo = function (record) {
    if (record.LightsPresent == 1) {
      return "WithLightsOn";
    } else {
      return "WithLightsOff";
    }
  }

  var getMapKey = function (record) {
    return getTimeOfDay(record) + getLightsInfo(record);
  }

  emit(getMapKey(this), 1);
  emit(getTimeOfDay(this) + "Total", 1);
}

function reduce (k, vals) {
  return Array.sum(vals);
}

function printCsv(record) {
  var csv = record._id + "," + record.value;

  print(csv);
}

db.accidents.mapReduce(map, reduce, {
  out: "accidentsToD"
})

db.accidentsToD.find().forEach(printCsv);
