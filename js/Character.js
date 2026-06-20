export default class Character {
    static characters = [
        { id: 0, name: "default", colors: ["red"], price: 0 },
        { id: 1, name: "star", colors: ["#4CAF50", "#1B5e20"], price: 11 },
        {
            id: 2,
            name: "target",
            colors: ["#ff9e19", "#ff6558", "#f0cf60"],
            price: 12,
        },
        { id: 3, name: "atom", colors: ["#df4f9e", "#6d35ff"], price: 15 },
    ];

    static STAR_COLOR = "#1b5e20";

    drawRectangle(ctx, color, x, y, width, height) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    }

    drawCircle(ctx, x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI * 1.5;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(
                Math.cos(rot) * outerRadius + cx,
                Math.sin(rot) * outerRadius + cy,
            );
            rot += step;

            ctx.lineTo(
                Math.cos(rot) * innerRadius + cx,
                Math.sin(rot) * innerRadius + cy,
            );
            rot += step;
        }

        ctx.closePath();
        ctx.fillStyle = Character.characters[1].colors[1];
        ctx.fill();
    }

    drawStarCharacter(ctx, topX, topY, width, height) {
        const midX = topX + width / 2;
        const midY = topY + height / 2;

        ctx.fillStyle = Character.characters[1].colors[0];
        ctx.fillRect(topX, topY, width, height);

        this.drawStar(ctx, midX, midY + 1, 5, width / 2 - 1, width / 5);
    }

    drawTargetCharacter(ctx, topX, topY, width, height) {
        const midX = topX + width / 2;
        const midY = topY + height / 2;
        const radius = Math.min(width, height) / 2;

        ctx.fillStyle = Character.characters[2].colors[0];
        ctx.fillRect(topX, topY, width, height);

        this.drawCircle(
            ctx,
            midX,
            midY,
            radius * 0.72,
            Character.characters[2].colors[1],
        );

        this.drawCircle(
            ctx,
            midX,
            midY,
            radius * 0.42,
            Character.characters[2].colors[2],
        );
    }

    // Atom character
    drawEllipse(ctx, x, y, radiusX, radiusY, rotation, color, lineWidth) {
        ctx.beginPath();
        ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }

    drawAtomCharacter(ctx, topX, topY, width, height) {
        const midX = topX + width / 2;
        const midY = topY + height / 2;

        const backgroundColor = Character.characters[3].colors[0];
        const atomColor = Character.characters[3].colors[1];

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(topX, topY, width, height);

        const radiusX = width * 0.33;
        const radiusY = height * 0.12;
        const lineWidth = width * 0.02;

        this.drawEllipse(
            ctx,
            midX,
            midY,
            radiusX,
            radiusY,
            0,
            atomColor,
            lineWidth,
        );

        this.drawEllipse(
            ctx,
            midX,
            midY,
            radiusX,
            radiusY,
            Math.PI / 3,
            atomColor,
            lineWidth,
        );

        this.drawEllipse(
            ctx,
            midX,
            midY,
            radiusX,
            radiusY,
            -Math.PI / 3,
            atomColor,
            lineWidth,
        );

        this.drawCircle(ctx, midX, midY, width * 0.05, atomColor);
    }
}
