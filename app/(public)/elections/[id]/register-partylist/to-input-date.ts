export default function toInputDate(value: string) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}
