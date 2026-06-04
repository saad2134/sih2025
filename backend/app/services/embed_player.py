from abc import ABC, abstractmethod
from typing import Dict, Optional, List
from datetime import datetime
from enum import Enum


class EmbedProvider(str, Enum):
    YOUTUBE = "youtube"
    VIMEO = "vimeo"
    CUSTOM_HTML5 = "custom_html5"
    COURSERA = "coursera"
    UDEMY = "udemy"
    SKILLSHARE = "skillshare"
    LINKEDIN_LEARNING = "linkedin_learning"
    DIRECT = "direct"
    NONE = "none"


class ProviderCapability:
    EMBEDDABLE = [
        EmbedProvider.YOUTUBE,
        EmbedProvider.VIMEO,
        EmbedProvider.CUSTOM_HTML5,
        EmbedProvider.DIRECT,
    ]
    REDIRECT_ONLY = [
        EmbedProvider.COURSERA,
        EmbedProvider.UDEMY,
        EmbedProvider.SKILLSHARE,
        EmbedProvider.LINKEDIN_LEARNING,
        EmbedProvider.NONE,
    ]

    @classmethod
    def can_embed(cls, provider: str) -> bool:
        try:
            return EmbedProvider(provider.lower()) in cls.EMBEDDABLE
        except:
            return False

    @classmethod
    def get_type(cls, provider: str) -> str:
        if cls.can_embed(provider):
            return "embed"
        return "redirect"


class EmbedConfig:
    def __init__(
        self,
        provider: EmbedProvider,
        embed_url: str,
        embed_id: str,
        enable_tracking: bool = True,
        autoplay: bool = False,
        start_time: int = 0,
    ):
        self.provider = provider
        self.embed_url = embed_url
        self.embed_id = embed_id
        self.enable_tracking = enable_tracking
        self.autoplay = autoplay
        self.start_time = start_time


class EmbedAdapter(ABC):
    @abstractmethod
    def get_embed_code(self, config: EmbedConfig) -> str:
        pass

    @abstractmethod
    def parse_video_id(self, url: str) -> Optional[str]:
        pass

    @abstractmethod
    def get_api_endpoint(self, video_id: str) -> Optional[str]:
        pass


class YouTubeAdapter(EmbedAdapter):
    def get_embed_code(self, config: EmbedConfig) -> str:
        params = []
        if config.autoplay:
            params.append("autoplay=1")
        if config.start_time > 0:
            params.append(f"start={config.start_time}")
        if config.enable_tracking:
            params.append("enablejsapi=1")

        query = "&".join(params) if params else ""
        base = f"https://www.youtube.com/embed/{config.embed_id}"
        return f'<iframe width="100%" height="100%" src="{base}{"?" + query if query else ""}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'

    def parse_video_id(self, url: str) -> Optional[str]:
        import re

        patterns = [
            r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([a-zA-Z0-9_-]{11})",
            r"youtube\.com/v/([a-zA-Z0-9_-]{11})",
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    def get_api_endpoint(self, video_id: str) -> Optional[str]:
        return f"https://www.googleapis.com/youtube/v3/videos?id={video_id}"


class VimeoAdapter(EmbedAdapter):
    def get_embed_code(self, config: EmbedConfig) -> str:
        params = []
        if config.autoplay:
            params.append("autoplay=1")
        if config.start_time > 0:
            params.append(f"t={config.start_time}")

        query = "&".join(params) if params else ""
        base = f"https://player.vimeo.com/video/{config.embed_id}"
        return f'<iframe src="{base}{"?" + query if query else ""}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>'

    def parse_video_id(self, url: str) -> Optional[str]:
        import re

        match = re.search(r"vimeo\.com/(\d+)", url)
        return match.group(1) if match else None

    def get_api_endpoint(self, video_id: str) -> Optional[str]:
        return f"https://api.vimeo.com/videos/{video_id}"


class CustomHTML5Adapter(EmbedAdapter):
    def get_embed_code(self, config: EmbedConfig) -> str:
        video_attrs = []
        if config.autoplay:
            video_attrs.append("autoplay")
        if config.enable_tracking:
            video_attrs.append("controls")

        return f'''
<video id="player-{config.embed_id}" class="custom-video-player" {" ".join(video_attrs)}>
    <source src="{config.embed_url}" type="video/mp4">
    Your browser does not support the video tag.
</video>
<script>
    window.addEventListener('load', function() {{
        initCustomPlayer('{config.embed_id}', {{
            embedId: '{config.embed_id}',
            enableTracking: {str(config.enable_tracking).lower()}
        }});
    }});
</script>
'''

    def parse_video_id(self, url: str) -> Optional[str]:
        if "://" in url:
            return url.split("/")[-1].split(".")[0]
        return None

    def get_api_endpoint(self, video_id: str) -> None:
        return None


class DirectVideoAdapter(EmbedAdapter):
    def get_embed_code(self, config: EmbedConfig) -> str:
        ext = config.embed_url.split(".")[-1].split("?")[0].lower()
        mime_type = f"video/{ext}" if ext in ["mp4", "webm", "ogg"] else "video/mp4"

        return f'''
<video width="100%" height="100%" controls>
    <source src="{config.embed_url}" type="{mime_type}">
    Your browser does not support the video tag.
</video>
'''

    def parse_video_id(self, url: str) -> Optional[str]:
        return url.split("/")[-1]

    def get_api_endpoint(self, video_id: str) -> None:
        return None


class EmbedPlayerService:
    def __init__(self):
        self.adapters = {
            EmbedProvider.YOUTUBE: YouTubeAdapter(),
            EmbedProvider.VIMEO: VimeoAdapter(),
            EmbedProvider.CUSTOM_HTML5: CustomHTML5Adapter(),
            EmbedProvider.DIRECT: DirectVideoAdapter(),
            EmbedProvider.NONE: DirectVideoAdapter(),
        }

    def get_adapter(self, provider: EmbedProvider) -> EmbedAdapter:
        return self.adapters.get(provider, DirectVideoAdapter())

    def build_embed_config(
        self,
        provider: str,
        url: str,
        embed_enabled: bool = True,
        autoplay: bool = False,
        start_time: int = 0,
    ) -> Optional[EmbedConfig]:
        if not embed_enabled:
            return None

        provider_enum = (
            EmbedProvider(provider.lower()) if provider else EmbedProvider.NONE
        )
        adapter = self.get_adapter(provider_enum)

        embed_id = None
        if provider_enum == EmbedProvider.YOUTUBE:
            embed_id = adapter.parse_video_id(url)
            if embed_id and "youtube.com/embed/" not in url:
                url = f"https://www.youtube.com/watch?v={embed_id}"
        elif provider_enum == EmbedProvider.VIMEO:
            embed_id = adapter.parse_video_id(url)
        elif provider_enum in [EmbedProvider.CUSTOM_HTML5, EmbedProvider.DIRECT]:
            embed_id = adapter.parse_video_id(url)

        if not embed_id and provider_enum != EmbedProvider.NONE:
            embed_id = url.split("/")[-1]

        if embed_id:
            return EmbedConfig(
                provider=provider_enum,
                embed_url=url,
                embed_id=embed_id,
                enable_tracking=True,
                autoplay=autoplay,
                start_time=start_time,
            )

        return None

    def get_embed_html(
        self,
        provider: str,
        url: str,
        is_embeddable: bool = True,
        autoplay: bool = False,
        start_time: int = 0,
    ) -> Dict:
        provider_lower = (provider or "").lower()
        can_embed = ProviderCapability.can_embed(provider_lower) and is_embeddable

        if not can_embed:
            return {
                "embed_enabled": False,
                "embed_type": "redirect",
                "redirect_url": url,
                "embed_html": None,
                "embed_provider": provider,
                "reason": f"{provider} courses require redirect to provider platform",
            }

        config = self.build_embed_config(provider, url, True, autoplay, start_time)

        if not config:
            return {
                "embed_enabled": False,
                "embed_type": "redirect",
                "redirect_url": url,
                "embed_html": None,
            }

        adapter = self.get_adapter(config.provider)

        return {
            "embed_enabled": True,
            "embed_type": "embed",
            "embed_provider": provider,
            "embed_id": config.embed_id,
            "embed_html": adapter.get_embed_code(config),
            "tracking_enabled": config.enable_tracking,
        }

    def get_tracking_config(self, provider: str, embed_id: str) -> Dict:
        provider_enum = (
            EmbedProvider(provider.lower()) if provider else EmbedProvider.NONE
        )
        adapter = self.get_adapter(provider_enum)

        tracking = {
            "enabled": True,
            "events": ["play", "pause", "seek", "ended", "timeupdate"],
            "api_endpoint": adapter.get_api_endpoint(embed_id),
        }

        if provider_enum == EmbedProvider.YOUTUBE:
            tracking.update(
                {
                    "library": "https://www.youtube.com/iframe_api",
                    "player_vars": {
                        "enablejsapi": 1,
                        "rel": 0,
                    },
                }
            )
        elif provider_enum == EmbedProvider.VIMEO:
            tracking.update(
                {
                    "library": "https://player.vimeo.com/api/player.js",
                }
            )

        return tracking


class CourseProgressTracker:
    def __init__(self):
        self.lesson_types = ["video", "reading", "quiz", "assignment", "interactive"]

    def calculate_progress(
        self,
        completed_lessons: List[str],
        total_lessons: int,
        weighted: bool = False,
    ) -> float:
        if total_lessons == 0:
            return 0.0

        if weighted:
            return sum(1 for l in completed_lessons) / total_lessons

        return len(completed_lessons) / total_lessons

    def update_enrolment_progress(
        self,
        enrolment_data: Dict,
        current_lesson_id: str,
        current_lesson_type: str,
        video_position: int,
        video_duration: int,
    ) -> Dict:
        progress_percent = 0.0
        if video_duration > 0:
            lesson_progress = video_position / video_duration
            progress_percent = min(lesson_progress * 100, 99.9)

        return {
            "current_lesson_id": current_lesson_id,
            "current_lesson_type": current_lesson_type,
            "current_position": video_position,
            "progress_percent": progress_percent,
            "last_watched_at": datetime.utcnow(),
        }

    def detect_completion(
        self,
        video_position: int,
        video_duration: int,
        threshold: float = 0.9,
    ) -> bool:
        if video_duration == 0:
            return False
        return video_position / video_duration >= threshold


embed_player_service = EmbedPlayerService()
progress_tracker = CourseProgressTracker()
