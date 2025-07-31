
from rest_framework import serializers

class BrandMapRequestSerializer(serializers.Serializer):
    """Serializer for the BrandMap API, simplified for core functionality."""
    brand_name = serializers.CharField(max_length=200)
    brand_description = serializers.CharField()
    origin_country = serializers.CharField(max_length=100)
    target_countries = serializers.ListField(
        child=serializers.CharField(max_length=100),
        allow_empty=False,
        min_length=1,
        max_length=5  # A reasonable limit for a single request
    )
    brand_keywords = serializers.ListField(
        child=serializers.CharField(max_length=100),
        allow_empty=False
    )
    competitors = serializers.ListField(
        child=serializers.CharField(max_length=100),
        allow_empty=True
    )

    def validate_target_countries(self, value):
        if not value:
            raise serializers.ValidationError("At least one target country is required.")
        return value
