import { Platform, StyleSheet, Dimensions } from 'react-native'
import React from 'react'

const { width } = Dimensions.get('window')
const BIG_CARD_WIDTH = width * 0.62
const SMALL_CARD_WIDTH = width * 0.48

export const CardStyles = StyleSheet.create({
    listCardContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 30,
        padding: 20,
        gap: 25
    },
    listCard: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        borderRadius: 26,
        borderWidth: 0.7,
        padding: 15,
        width: '100%',
        height: 150,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 24,
        elevation: 5
    },
    listCardColumn: {
        flex: 1,
        flexDirection: 'column',
        gap: 7
    },
    listCardText: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        height: '100%',
        marginTop: 5
    },
    listImage: {
        overflow: 'hidden',
        width: 100,
        height: '100%',
        borderRadius: 24
    },
    flexCardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    flexLargeCard: {
        width: BIG_CARD_WIDTH,
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        overflow: 'hidden',
    },
    flexLargeCardImage: {
        width: '100%',
        height: 160,
    },
    flexSmallCard: {
        width: SMALL_CARD_WIDTH,
        borderRadius: 18,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
        overflow: 'hidden',
    },
    flexSmallCardImage: {
        width: '100%',
        height: 130,
    },
    flexCardDetails: {
        padding: 12,
        gap: 4,
    },
    cardLocation: {
        fontSize: 14,
        fontWeight: 500
    },
    flexSmallCardDetails: {
        padding: 10,
        gap: 3,
    },
    cardDetailsRowWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    bedRoomAndRating: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        
    }
})