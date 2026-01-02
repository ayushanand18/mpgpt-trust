package utils

// GetUniqueUint32Slice returns a slice containing only unique uint32 values from the input slice.
func GetUniqueUint32Slice(input []uint32) []uint32 {
	uniqueMap := make(map[uint32]bool)
	var uniqueSlice []uint32

	for _, item := range input {
		if _, exists := uniqueMap[item]; !exists {
			uniqueMap[item] = true
			uniqueSlice = append(uniqueSlice, item)
		}
	}

	return uniqueSlice
}