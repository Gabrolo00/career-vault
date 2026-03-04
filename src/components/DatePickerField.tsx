import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, radius, spacing, typography } from '../theme';

interface DatePickerFieldProps {
    label: string;
    value: string; // YYYY-MM-DD or ''
    onChange: (dateString: string) => void;
    disabled?: boolean;
    minDate?: Date;
    maxDate?: Date;
}

export function DatePickerField({
    label,
    value,
    onChange,
    disabled = false,
    minDate,
    maxDate,
}: DatePickerFieldProps) {
    const [show, setShow] = useState(false);

    // Parse current value or default to today
    const dateValue = value ? new Date(value + 'T12:00:00') : new Date();

    const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
        // On Android, picker closes automatically; on iOS keep it open
        if (Platform.OS !== 'ios') setShow(false);
        if (selected) {
            // Format to YYYY-MM-DD
            const yyyy = selected.getFullYear();
            const mm = String(selected.getMonth() + 1).padStart(2, '0');
            const dd = String(selected.getDate()).padStart(2, '0');
            onChange(`${yyyy}-${mm}-${dd}`);
        }
    };

    const displayLabel = value
        ? new Date(value + 'T12:00:00').toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
        : 'Seleziona data';

    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            <Pressable
                style={[styles.button, disabled && styles.buttonDisabled]}
                onPress={() => !disabled && setShow(true)}
                disabled={disabled}
            >
                <Text style={[styles.dateText, !value && styles.placeholder]}>
                    {displayLabel}
                </Text>
                <Text style={styles.icon}>📅</Text>
            </Pressable>

            {show && (
                <DateTimePicker
                    value={dateValue}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                    onChange={handleChange}
                    minimumDate={minDate}
                    maximumDate={maxDate ?? new Date()}
                    locale="it-IT"
                />
            )}

            {/* iOS: confirm button to dismiss */}
            {show && Platform.OS === 'ios' && (
                <Pressable style={styles.iosConfirm} onPress={() => setShow(false)}>
                    <Text style={styles.iosConfirmText}>Conferma</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { gap: 6 },
    label: { ...typography.label },
    button: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 13,
    },
    buttonDisabled: { opacity: 0.35 },
    dateText: { fontSize: 15, color: colors.textPrimary },
    placeholder: { color: colors.textPlaceholder },
    icon: { fontSize: 18 },
    iosConfirm: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 4,
    },
    iosConfirmText: { color: '#fff', fontWeight: '700' },
});
