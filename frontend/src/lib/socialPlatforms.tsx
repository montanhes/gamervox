import { Globe } from 'lucide-react'
import {
  DiscordIcon,
  FacebookIcon,
  InstagramIcon,
  SteamIcon,
  TiktokIcon,
  TwitchIcon,
  XIcon,
  YoutubeIcon,
} from '@/components/SocialIcons'

// Valores espelham o enum App\Enums\SocialPlatform do backend.
export const SOCIAL_PLATFORMS: {
  value: string
  label: string
  Icon: (props: { size?: number }) => React.ReactNode
}[] = [
  { value: 'x', label: 'X', Icon: XIcon },
  { value: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  { value: 'youtube', label: 'YouTube', Icon: YoutubeIcon },
  { value: 'discord', label: 'Discord', Icon: DiscordIcon },
  { value: 'twitch', label: 'Twitch', Icon: TwitchIcon },
  { value: 'tiktok', label: 'TikTok', Icon: TiktokIcon },
  { value: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { value: 'steam', label: 'Steam', Icon: SteamIcon },
  { value: 'website', label: 'Website', Icon: ({ size = 16 }) => <Globe size={size} /> },
]

export function getSocialPlatform(value: string) {
  const name = value.toLowerCase()
  return (
    SOCIAL_PLATFORMS.find((platform) => platform.value === name) ?? {
      value: name,
      label: value,
      Icon: ({ size = 16 }: { size?: number }) => <Globe size={size} />,
    }
  )
}
