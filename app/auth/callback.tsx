import { ActivityIndicator, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { colors } from '../../src/theme';

// Chiude il browser OAuth e restituisce il controllo a signInWithGoogle
WebBrowser.maybeCompleteAuthSession();

export default function AuthCallbackScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
            <ActivityIndicator color={colors.primary} />
        </View>
    );
}
