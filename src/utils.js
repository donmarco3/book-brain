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
            throw new Error("Invalid page format")
        }
        return range.split(",").map(item => item.trim()).join(", ")
    } else if (newRange.includes("-") && !newRange.includes(",")) {
        if (!validateRange(range)) {
            throw new Error("Invalid page format")
        }
    } else {
        if (parseInt(range).toString() !== range) {
            throw new Error("Invalid page format")
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