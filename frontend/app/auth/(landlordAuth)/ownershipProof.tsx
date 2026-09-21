import React, { useEffect, useState } from 'react'
import {
    StyleSheet,
    Dimensions,
    Alert,
    TouchableOpacity,
    ScrollView,
    Image,
    View,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { PageStyles } from '@/components/globalStyles/pageStyles'
import Button from '@/components/button'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { CircleCheckBig, CloudUpload, FileText, Image as ImageIcon, Check, RotateCcw } from 'lucide-react-native'
import * as Progress from 'react-native-progress'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import Toast from 'react-native-toast-message'
import { toastConfig } from '@/components/toastConfig'
import { useAuth } from '@/contexts/AuthContext'

const requirements = [
    "Owner's name must match your profile",
    'All text must be clearly legible',
    'Document must be currently valid',
]

type SelectedFileType = 'image' | 'pdf' | 'unknown'

export default function OwnershipProof() {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const colorThemeRenderer = usePageThemeRender()
    const { setVerification } = useAuth()
    const dimension = Dimensions.get('window').width

    const [progress, setProgress] = useState(0.75)
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
    const [selectedFileType, setSelectedFileType] = useState<SelectedFileType>('unknown')
    const [isConfirmed, setIsConfirmed] = useState(false)

    useEffect(() => {
        setProgress(1)
    }, [])

    const clearSelection = () => {
        setSelectedFile(null)
        setSelectedFileName(null)
        setSelectedFileType('unknown')
        setIsConfirmed(false)
    }

    const handleSelectFile = () => {
        Alert.alert(
            'Select Document',
            'Choose how to upload your title deed',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Browse Files (PDF)', onPress: pickDocument },
                { text: 'Choose Image', onPress: pickImage },
            ]
        )
    }

    const setPickedAsset = (asset: { uri: string; name?: string | null; mimeType?: string | null }) => {
        setSelectedFile(asset.uri)
        setSelectedFileName(asset.name ?? 'Selected file')
        const mime = asset.mimeType ?? ''
        setSelectedFileType(mime.includes('pdf') ? 'pdf' : mime.startsWith('image/') ? 'image' : 'unknown')
        setIsConfirmed(false)
    }

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/jpeg', 'image/png'],
                copyToCacheDirectory: true,
                multiple: false,
            })

            if (!result.canceled && result.assets?.length > 0) {
                setPickedAsset(result.assets[0])
            }
        } catch {
            Alert.alert('Error', 'Failed to pick document. Please try again.')
        }
    }

    const pickImage = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!perm.granted) {
            Alert.alert('Permission required', 'Please allow access to your gallery.')
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.9,
        })

        if (!result.canceled && result.assets?.length > 0) {
            const asset = result.assets[0]
            setSelectedFile(asset.uri)
            const uriParts = asset.uri.split('/')
            setSelectedFileName(uriParts[uriParts.length - 1] || 'Selected image')
            setSelectedFileType('image')
            setIsConfirmed(false)
        }
    }

    const handleConfirmSelection = () => {
        if (!selectedFile) {
            Alert.alert('No document', 'Please upload your title deed first.')
            return
        }
        setIsConfirmed(true)
        Toast.show({
            type: 'success',
            text1: 'Document uploaded successfully',
            position: 'bottom',
            visibilityTime: 1000
        })
    }

    const handleSubmit = () => {
        if (!selectedFile) {
            Alert.alert('No document', 'Please upload your title deed before finishing.')
            return
        }

        if (!isConfirmed) {
            Alert.alert('Confirm selection', 'Please confirm the selected file before continuing.')
            return
        }
        Toast.show({
            type: 'success',
            text1: 'Sign up successful',
            position: 'bottom',
            visibilityTime: 1800,
        })
        // The verification screens are a local frontend flow for now. Treat a
        // completed submission as verified so a landlord can immediately
        // exercise the listing experience while the API is still pending.
        setVerification('verified')
        router.replace('/(landlordScreens)')
    }

    return (
        <ThemedView style={PageStyles.container}>
            <ThemedView style={{ marginHorizontal: 10, marginBottom: 20, gap: 10, paddingTop: 10 }}>
                <ThemedView style={PageStyles.progressIndicatorTitle}>
                    <ThemedText>VERIFICATION COMPLETE</ThemedText>
                    <ThemedText type="link" style={{ color: '#10B981' }}>100%</ThemedText>
                </ThemedView>
                <Progress.Bar
                    progress={progress}
                    width={dimension - 40}
                    color={'#10B981'}
                    borderWidth={0}
                    unfilledColor={colorScheme === 'light' ? Colors.light.borderColor : Colors.light.tint}
                    animated={true}
                    animationType="timing"
                    animationConfig={{ duration: 1000 }}
                />
            </ThemedView>

            <ScrollView contentContainerStyle={{ paddingBottom: 35 }} showsVerticalScrollIndicator={false}>
                <ThemedView style={{ gap: 10, marginBottom: 24 }}>
                    <ThemedText style={[PageStyles.formTitle, { color: colorThemeRenderer.oppositeTextColor }]}>
                        Upload Title Deed
                    </ThemedText>
                    <ThemedText type="description">
                        To ensure a secure community, please provide a high-quality
                        scan or photo of your property title deed or indenture to verify ownership.
                    </ThemedText>
                </ThemedView>

                <ThemedView
                    style={[
                        styles.uploadBox,
                        {
                            borderColor: Colors[colorScheme ?? 'light'].tint + '66',
                            backgroundColor: colorScheme === 'light' ? '#F4F3FC' : '#1e1e2e',
                        },
                    ]}
                >
                    <ThemedView
                        style={[
                            styles.uploadIconWrap,
                            {
                                backgroundColor: colorScheme === 'light' ? '#E8E6F8' : '#2a2a3e',
                            },
                        ]}
                    >
                        <CloudUpload color={Colors[colorScheme ?? 'light'].tint} size={28} />
                    </ThemedView>

                    {selectedFileName ? (
                        <>
                            <ThemedText style={styles.uploadTitle}>Document selected</ThemedText>
                            <ThemedText type="description" style={{ textAlign: 'center', marginBottom: 12 }}>
                                {selectedFileName}
                            </ThemedText>

                            <ThemedView style={styles.previewBox}>
                                {selectedFileType === 'image' && selectedFile ? (
                                    <Image source={{ uri: selectedFile }} style={styles.imagePreview} resizeMode="cover" />
                                ) : (
                                    <ThemedView style={styles.pdfPreview}>
                                        <FileText color={Colors[colorScheme ?? 'light'].tint} size={42} />
                                        <ThemedText style={{ marginTop: 10, fontWeight: '600' }}>
                                            {selectedFileType === 'pdf' ? 'PDF Document' : 'File Ready'}
                                        </ThemedText>
                                        <ThemedText type="description" style={{ textAlign: 'center', marginTop: 4 }}>
                                            Preview not available for this file type in-line.
                                        </ThemedText>
                                    </ThemedView>
                                )}
                            </ThemedView>

                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={[styles.smallActionBtn, { backgroundColor: '#10B981' }]}
                                    onPress={handleConfirmSelection}
                                    activeOpacity={0.8}
                                >
                                    <Check color="#fff" size={16} />
                                    <ThemedText style={styles.smallActionBtnText}>Confirm</ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.smallActionBtn, { backgroundColor: '#6B7280' }]}
                                    onPress={handleSelectFile}
                                    activeOpacity={0.8}
                                >
                                    <RotateCcw color="#fff" size={16} />
                                    <ThemedText style={styles.smallActionBtnText}>Change</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            <ThemedText style={styles.uploadTitle}>Drop your document here</ThemedText>
                            <ThemedText type="description" style={{ marginBottom: 16, textAlign: 'center' }}>
                                Supports PDF, JPG, or PNG up to 10MB
                            </ThemedText>

                            <TouchableOpacity
                                style={[
                                    styles.selectFileBtn,
                                    {
                                        backgroundColor: Colors[colorScheme ?? 'light'].tint,
                                    },
                                ]}
                                onPress={handleSelectFile}
                                activeOpacity={0.8}
                            >
                                <ThemedText style={styles.selectFileBtnText}>
                                    Select File
                                </ThemedText>
                            </TouchableOpacity>
                        </>
                    )}
                </ThemedView>

                <ThemedView
                    style={[
                        styles.requirementsBox,
                        {
                            backgroundColor: colorThemeRenderer.tipsBackground,
                        },
                    ]}
                >
                    <ThemedText style={styles.requirementsLabel}>SUBMISSION REQUIREMENTS</ThemedText>
                    {requirements.map((req, index) => (
                        <ThemedView key={index} style={styles.requirementRow}>
                            <CircleCheckBig color={'#10B981'} />
                            <ThemedText style={{ flex: 1, color: colorThemeRenderer.tipsTextColor }}>
                                {req}
                            </ThemedText>
                        </ThemedView>
                    ))}
                </ThemedView>

                <Button action={handleSubmit} disabled={!selectedFile || !isConfirmed}>
                    <ThemedText type="placeholderText">
                        {isConfirmed ? 'Finish Signup' : 'Confirm File First'}
                    </ThemedText>
                </Button>

                <ThemedText style={styles.disclaimer}>
                    By clicking finish, you agree to our Landlord Terms of Service.
                </ThemedText>
            </ScrollView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    uploadBox: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 20,
        alignItems: 'center',
        paddingVertical: 36,
        paddingHorizontal: 24,
        marginBottom: 18,
        gap: 6,
    },
    uploadIconWrap: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    uploadTitle: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    selectFileBtn: {
        marginTop: 8,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 999,
    },
    selectFileBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    previewBox: {
        width: '100%',
        marginTop: 10,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        backgroundColor: '#fff',
    },
    imagePreview: {
        width: '100%',
        height: 220,
    },
    pdfPreview: {
        minHeight: 220,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 14,
        width: '100%',
    },
    smallActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 999,
    },
    smallActionBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    requirementsBox: {
        borderWidth: 1,
        padding: 15,
        marginBottom: 32,
        borderRadius: 20,
        borderColor: '#b0f7c9',
        gap: 4,
    },
    requirementsLabel: {
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 0.8,
        color: '#10B981',
        marginBottom: 10,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 5,
        backgroundColor: 'transparent',
    },
    disclaimer: {
        textAlign: 'center',
        marginTop: 12,
    },
})
