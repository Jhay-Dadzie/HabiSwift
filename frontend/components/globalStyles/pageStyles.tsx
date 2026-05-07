import { Platform, StyleSheet } from 'react-native'
import React from 'react'

export const PageStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10
    },
    formContainer: {
        padding: 20,
        borderRadius: 26,
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 24,
        elevation: 5,
        margin: 10
    },
    formTitle: {
        fontSize: 32,
        fontWeight: 600,
    },
    form: {
        flex: 1,
        gap: 10
    },
    formInput: {
        borderWidth: 2,
        borderRadius: 16,
        height: 56,
        paddingLeft: 46,
        paddingRight: 10,
    },
    label: {
        fontSize: 18,
        fontWeight: 500,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#615f5f',
        shadowOffset: {width: 0, height: 1},
        shadowRadius: 24,
        elevation: 5,
        paddingVertical: 6,
        paddingLeft: 15,
        borderWidth: 1,
        borderRadius: 16,
        marginVertical: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: 500
    },
    errorText: {
        color: 'red',
        marginTop: -5
    },
    bottomFormText: {
        flexDirection: "row",
        alignItems: 'center',
        gap: 6,
        alignSelf: 'center',
        marginTop: 15
    },
    line: {
        height: 1,
        flex: 1
    },
    continueWith: {
        flexDirection: 'row',
        marginVertical: 30,
        alignItems: 'center'
    },
    authOptionContainer: {
        flex: 1,
        gap: 20,
        marginBottom: 30
    },
    authOptionButton: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
        borderWidth: 2,
        borderRadius: 16,
        height: 56,
    },
    authIcon: {
        width: 24,
        height: 24
    },
    authText: {
        fontSize: 20,
        fontWeight: '500'
    },
    progressIndicatorTitle: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        borderWidth: 1,
        paddingHorizontal: 14,
        marginHorizontal: 10,
        marginBottom: 15,
        height: 48,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    filterRow: {
        paddingHorizontal: 10,
        gap: 10,
        marginBottom: 12,
    },
    filters: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    filtersText: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
    },

    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20
    },
    emptyText: {
        paddingVertical: 20,
        fontSize: 28,
        fontWeight: 500,

    },
    emptyStateImage: {
        width: 150,
        height: 150
    }
})