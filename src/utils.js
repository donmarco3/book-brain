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
    // 7
    // 7-12
    // 7-12, 23-26, 80-95

    const newRange = range.split("")
    let type = ""
    if (newRange.includes(",")) {
        type = "ranges"
    } else if (newRange.includes("-") && !newRange.includes(",")) {
        type = "range"
    } else {
        type = "number"
    }
}