import { StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Text, Dimensions } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import React, { useState, useEffect } from 'react'
import { PageStyles } from '@/components/globalStyles/pageStyles'
import Button from '@/components/button'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { ActivityIndicator } from 'react-native'
import { Eye, EyeClosed, LockKeyhole, Mail, Phone, UserRound, MoveRight } from 'lucide-react-native'
import usePageThemeRender  from '@/components/globalStyles/pageThemeRender'
import * as Progress from 'react-native-progress'
import { useAuth } from '@/contexts/AuthContext'
import { validateEmail, validateFullName, validatePassword, validatePhone } from '@/utils/validation'

export default function LandlordSignUp() {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const colorThemeRenderer = usePageThemeRender()
    const { signUp, pending } = useAuth()
    const dimension = Dimensions.get('window').width

    const [progress, setProgress] = useState(0)
    useEffect(() => {
        setProgress(0.25);
    }, []);

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [password, setPassword] = useState('')
    const [viewPassword, setViewPassword] = useState(true)
    
    const [error, setError] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
    })
    const isValid = fullName.trim().length > 0 && email.trim().length > 0 && phoneNumber.trim().length > 0 && password.length > 0

    const handleSubmit= async () => {
        const newErrors = {
            fullName: validateFullName(fullName) ?? '',
            email: validateEmail(email) ?? '',
            phoneNumber: validatePhone(phoneNumber) ?? '',
            password: validatePassword(password) ?? '',
        }
        setError(newErrors)


        if (Object.values(newErrors).some(e => e)) return;

        try {
            await signUp({ fullName, email, phone: phoneNumber, password, role: 'landlord' })
            router.push('/auth/cardIdentity')
        } catch {
            setError((current) => ({ ...current, email: 'An account with these details may already exist' }))
        }
    }
    
    return (
        <KeyboardAvoidingView style={[PageStyles.container,
                {backgroundColor: Colors[colorScheme ?? 'light'].background,
                padding: 10
            }]}
            behavior = {Platform.OS === 'android' ? 'height' : 'padding'}
        >
            <ThemedView style={{marginHorizontal: 10, marginBottom: 20, gap: 10}}>
                <ThemedView style={PageStyles.progressIndicatorTitle}>
                    <ThemedText>PERSONAL INFORMATION</ThemedText>
                    <ThemedText type='link' style={{color: colorThemeRenderer.link}}>1 of 4</ThemedText>
                </ThemedView>

                <Progress.Bar progress={progress}
                    width={dimension-40}
                    color={Colors[colorScheme ?? 'light'].tint}
                    borderWidth={0}
                    unfilledColor={colorScheme === 'light' ? Colors.light.borderColor : Colors.light.tint}
                    animated={true}
                    animationType='timing'
                    animationConfig={{duration: 1000}}
                />

            </ThemedView>

            <ScrollView
                keyboardShouldPersistTaps = "handled"
                contentContainerStyle={{
                    paddingBottom: 40
                }}
                style={[PageStyles.formContainer, {borderColor: colorThemeRenderer.borderColor,
                    backgroundColor: colorScheme === 'light' ? Colors.light.background : Colors.dark.background,
                }]}
                showsVerticalScrollIndicator = {false}
            >
                <ThemedView style={{display: 'flex', gap: 15, marginTop: 15, marginBottom: 30}}>
                    <ThemedText style={[PageStyles.formTitle, {color: colorThemeRenderer.oppositeTextColor}]}>Create your account</ThemedText>
                    <ThemedText type='description'>Join our community of premium property owners and manage with ease</ThemedText>
                </ThemedView>

                <ThemedView style={PageStyles.form}>
                    {/* Full name */}
                    <ThemedView>
                        <ThemedText style={[PageStyles.label, {color: colorThemeRenderer.label}]}>Full Name</ThemedText>
                        <ThemedView style={[PageStyles.inputContainer, {
                            borderColor: error.fullName ? 'red' : colorThemeRenderer.borderColor,
                            backgroundColor: colorThemeRenderer.secondaryBackground
                        }]}>
                            <UserRound size={24} color={Colors[colorScheme ?? 'light'].icon}/>
                            <TextInput style={[PageStyles.textInput, {
                                    color: colorThemeRenderer.fontColor
                                }]} 
                                placeholder='John Doe'
                                placeholderTextColor={colorThemeRenderer.fontColor}
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </ThemedView>
                        
                        {error.fullName && (
                            <ThemedText style={PageStyles.errorText}>
                                {error.fullName}
                            </ThemedText>
                        )}
                    </ThemedView>

                    {/* Email Address */}
                    <ThemedView>
                        <ThemedText style={[PageStyles.label, {color: colorThemeRenderer.label}]}>Email Address</ThemedText>
                        <ThemedView style={[PageStyles.inputContainer, {
                            borderColor: error.email ? 'red' : colorThemeRenderer.borderColor,
                            backgroundColor: colorScheme === 'light' ? '#F8FAFC' : '#1E293B'
                        }]}>
                            <Mail size={24} color={Colors[colorScheme ?? 'light'].icon}/>
                            <TextInput style={[PageStyles.textInput, {
                                    color:  colorThemeRenderer.fontColor
                                }]} 
                                placeholder='example@gmail.com'
                                placeholderTextColor={colorThemeRenderer.fontColor}
                                value={email}
                                onChangeText={setEmail}
                                inputMode='email'
                            />
                        </ThemedView>

                        {error.email && (
                            <ThemedText style={PageStyles.errorText}>
                                {error.email}
                            </ThemedText>
                        )}
                    </ThemedView>

                    {/* Phone Number */}
                    <ThemedView>
                        <ThemedText style={[PageStyles.label, {color: colorThemeRenderer.label}]}>Phone Number</ThemedText>
                        <ThemedView style={[PageStyles.inputContainer, {
                            borderColor: error.phoneNumber ? 'red' : colorThemeRenderer.borderColor,
                            backgroundColor: colorScheme === 'light' ? '#F8FAFC' : '#1E293B'
                        }]}>
                            <Phone size={24} color={Colors[colorScheme ?? 'light'].icon}/>
                            <TextInput style={[PageStyles.textInput, {
                                    color: colorThemeRenderer.fontColor
                                }]} 
                                placeholder='+1 (123) 456-7890'
                                placeholderTextColor={colorThemeRenderer.fontColor}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                inputMode='tel'
                            />
                        </ThemedView>

                        {error.phoneNumber && (
                            <ThemedText style={PageStyles.errorText}>
                                {error.phoneNumber}
                            </ThemedText>
                        )}
                    </ThemedView>

                    {/* Password */}
                    <ThemedView>
                        <ThemedText style={[PageStyles.label, {color: colorThemeRenderer.label}]}>Password</ThemedText>
                        <ThemedView style={[PageStyles.inputContainer, {
                            borderColor: error.password ? 'red' : colorThemeRenderer.borderColor,
                            backgroundColor: colorScheme === 'light' ? '#F8FAFC' : '#1E293B'
                        }]}>
                            <LockKeyhole size={24} color={Colors[colorScheme ?? 'light'].icon}/>
                            <TextInput style={[PageStyles.textInput, {
                                    color: colorThemeRenderer.fontColor
                                }]} 
                                placeholder='Enter your password'
                                placeholderTextColor={colorThemeRenderer.fontColor}
                                secureTextEntry={viewPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <Pressable onPress={() => setViewPassword(prev => !prev)}
                                style={{marginRight: 8}}
                            >
                                {
                                    viewPassword === true ? (<EyeClosed color={Colors[colorScheme ?? 'light'].icon}/>)
                                    : (<Eye color={Colors[colorScheme ?? 'light'].icon}/>)
                                    
                                }
                            </Pressable>
                            
                        </ThemedView>

                        {error.password && (
                            <ThemedText style={PageStyles.errorText}>
                                {error.password}
                            </ThemedText>
                        )}
                    </ThemedView>

                </ThemedView>

                <ThemedView style={{marginTop: 30}}>
                    <Button action={handleSubmit} disabled={!isValid || pending}>
                        {pending ? <ActivityIndicator color="#fff" /> : <><ThemedText type='placeholderText'>Next Step</ThemedText><MoveRight color={'#fff'}/></>}
                    </Button>
                </ThemedView>
                

                <ThemedView style={PageStyles.bottomFormText}>
                    <ThemedText type='description'>Already have an account?</ThemedText>
                    <Pressable onPress={() => router.replace('/auth')}>
                        <ThemedText type='link' style={{color: colorThemeRenderer.link}}>Login</ThemedText>
                    </Pressable>
                </ThemedView>
            </ScrollView>
        </KeyboardAvoidingView>
        
    )
}

const styles = StyleSheet.create({})
