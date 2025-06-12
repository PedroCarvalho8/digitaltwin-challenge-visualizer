import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export type SectionProps = {
    children: React.ReactNode;
    title: string;
    hasContainer?: boolean;
    hideTitle?: boolean;
    action?: (event: GestureResponderEvent) => void;
    actionTitle?: string
}

export default function Section ({ children, title, hasContainer, hideTitle, action, actionTitle }: SectionProps) {
    const colorScheme = useColorScheme();

    return (
        <View style={styles.mainContainer}>
            <View style={styles.titleContainer}>
                <Text style={[(hideTitle ? styles.hide : styles.title), {color: Colors[colorScheme ?? 'light'].tint}]}>{title}</Text>
                {
                    action && (
                        <TouchableOpacity onPress={action}>
                            <Text style={styles.actionText}>{actionTitle}</Text>
                        </TouchableOpacity>
                    )
                }

            </View>
            {
                !hasContainer ? (
                    <View style={[styles.card, {backgroundColor: colorScheme == 'dark' ? 'rgba(255,255,255,0.1)' : '#fff'}]}>
                        {children}
                    </View>
                ) : (
                    <View>
                        {children}
                    </View>  
                )
            }
            
        </View>
    )
}

const styles = StyleSheet.create({
    actionText: {
        color: '#6FACDD'
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    title: {
        fontWeight: '500',
        fontSize: 20,
        marginBottom: 12,
    },
    card: {
        gap: 20,
        padding: 20,
        borderRadius: 20,
        shadowColor: "rgba(0, 0, 0, 0.3)",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.05,
        shadowRadius: 5.62,
        elevation: 7,
    },
    mainContainer: {
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    hide: {
        opacity: 0,
        position: 'absolute'
    }
})