"use client"

import * as React from "react"
import { format } from "date-fns"
import { it } from 'date-fns/locale';

import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    buttonText: string;
    onDateChange: (date: Date | undefined) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ buttonText, onDateChange }) => {
    const [date, setDate] = React.useState<Date | undefined>(undefined);

    const handleDateChange = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        onDateChange(selectedDate);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: it }) : <span>{buttonText}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                    locale={it}
                />
            </PopoverContent>
        </Popover>
    )
}

export default DatePicker;
