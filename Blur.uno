using Uno;
using Uno.Graphics;
using Uno.UX;
using Fuse.Elements;
using Fuse.Designer;
using Fuse.Drawing.Primitives;

namespace Fuse.PatchedEffects
{
	/**
		@mount Graphics Effects
	*/
	public sealed class Blur : Fuse.Effects.BasicEffect
	{
		public Blur() :
			base(Fuse.Effects.EffectType.Composition)
		{
			Radius = 3;
		}

		float _radius;
		[Range(0, 100, 2)]
		public float Radius
		{
			get { return _radius; }
			set
			{
				if (_radius != value)
				{
					_radius = value;

					OnRenderingChanged();
					OnRenderBoundsChanged();
				}
			}
		}

		public override VisualBounds ModifyRenderBounds( VisualBounds inBounds )
		{
			return inBounds.InflateXY(Padding);
		}

		internal float Sigma { get { return Math.Max(Radius, 1e-5f); } }
		internal float Padding { get { return Math.Ceil(Sigma * 3 * Element.AbsoluteZoom) / Element.AbsoluteZoom; } }

		protected override void OnRender(DrawContext dc, Rect elementRect)
		{
			Rect paddedRect = Rect.Inflate(elementRect, Padding);

			// capture stuff
			var original = Element.CaptureRegion(dc, paddedRect, int2(0));
			if (original == null)
				return;

			var blur = EffectHelpers.Instance.Blur(original.ColorBuffer, dc, Sigma * Element.AbsoluteZoom);
			FramebufferPool.Release(original);

			draw Fuse.Drawing.Planar.Image
			{
				DrawContext: dc;
				Visual: Element;
				Position: elementRect.Minimum - Padding;
				Invert: true;
				Size: paddedRect.Size;
				Texture: blur.ColorBuffer;

				apply Fuse.Drawing.Planar.PreMultipliedAlphaCompositing;
			};

			FramebufferPool.Release(blur);
		}
	}
}