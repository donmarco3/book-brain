export function sliceString(string) {
    if (string.length < 300) {
        return string
    } else {
        for (let i = 300; i < string.length; i++) {
            if (string[i] === " ") {
                return string.slice(0, i) + "..."
            }
        }
        return string
    }
}

export function validatePageRange(range) {
    const newRange = range.split("")

    if (newRange.includes(",")) {
        if (!range.split(",").every(item => validateRange(item.trim()))) {
            throw new Error("Invalid page format. Accepted page formats; 42 or 7-12 or 7-12, 23-45")
        }
        return range.split(",").map(item => item.trim()).join(", ")
    } else if (newRange.includes("-") && !newRange.includes(",")) {
        if (!validateRange(range)) {
            throw new Error("Invalid page format. Accepted page formats; 42 or 7-12 or 7-12, 23-45")
        }
    } else {
        if (parseInt(range).toString() !== range) {
            throw new Error("Invalid page format. Accepted page formats; 42 or 7-12 or 7-12, 23-45")
        }
    }
    return range
}

function validateRange(range) {
    const rangeArr = range.split("-")
    const rangeStart = parseInt(rangeArr[0])
    const rangeEnd = parseInt(rangeArr[1])
    
    if (rangeArr.length !== 2 || isNaN(rangeStart) || isNaN(rangeEnd) || rangeStart >= rangeEnd) {
        return false
    } else {
        return true
    }
}

export function splitOnNewLine(string) {
    return string.split("\n\n")
}

export function calculateProgress(progress, totalPages) {
    if (progress === totalPages) {
        return 100
    } else {
        return Math.floor((progress / totalPages) * 100)
    }
}

function toRoman(num) {
  const map = {
    M: 1000, CM: 900, D: 500, CD: 400,
    C: 100, XC: 90, L: 50, XL: 40,
    X: 10, IX: 9, V: 5, IV: 4, I: 1
  };
  let result = '';
  for (let key in map) {
    const repeatCount = Math.floor(num / map[key]);
    if (repeatCount > 0) {
      result += key.repeat(repeatCount);
      num %= map[key];
    }
  }
  return result;
}

export function formatDateToRoman(date = new Date()) {
    const day = toRoman(date.getDate())
    const month = toRoman(date.getMonth() + 1)
    const year = toRoman(date.getFullYear())

    return `${day} \u{00B7} ${month} \u{00B7} ${year}`
}

export function getDaysAgo(date) {
    const pastDate = new Date(date)
    const today = new Date()

    const diffTime = today - pastDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
        return `${diffDays} day ago`
    } else if (diffDays === 0) {
        return `today`
    } else {
        return `${diffDays} days ago`
    }
}