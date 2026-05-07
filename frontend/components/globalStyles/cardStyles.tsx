import { Platform, StyleSheet } from 'react-native'
import React from 'react'

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
    }
})